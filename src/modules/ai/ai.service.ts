import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClubsService } from '../clubs/clubs.service';
import { firstValueFrom } from 'rxjs';

export interface ClubInsight {
  id: string;
  name: string;
  category: string;
}

export interface ProfileInsightResult {
  character: string;
  interests: string[];
  suggestions: string[];
  recommendedClubs: ClubInsight[];
}

/**
 * AiService
 *
 * Orchestrates the profile insight generation:
 * 1. Fetch joined clubs for the user.
 * 2. Fetch all clubs from the system.
 * 3. Build a structured Turkish prompt.
 * 4. Call OpenRouter API (owl-alpha model).
 * 5. Parse and return the structured JSON response.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly OPENROUTER_API_URL =
    'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly clubsService: ClubsService,
  ) {}

  async generateProfileInsight(userId: string): Promise<ProfileInsightResult> {
    // --- Step 1: Get user's joined clubs ---
    const joinedClubs = await this.clubsService.getJoinedClubs(userId);

    if (!joinedClubs || joinedClubs.length === 0) {
      throw new BadRequestException(
        'NO_CLUBS',
      );
    }

    // --- Step 2: Get all clubs for recommendation ---
    const allClubsResponse = await this.clubsService.listClubs({
      page: 1,
      limit: 100,
    });
    const allClubs = allClubsResponse.data;

    // --- Step 3: Find clubs user has NOT joined ---
    const joinedClubIds = new Set(joinedClubs.map((c) => c.id));
    const notJoinedClubs = allClubs.filter((c) => !joinedClubIds.has(c.id));

    // --- Step 4: Build the prompt ---
    const joinedList = joinedClubs
      .map((c) => `- ${c.name} (Kategori: ${c.category || 'Genel'})`)
      .join('\n');

    const availableList = notJoinedClubs
      .map(
        (c) =>
          `- ID: ${c.id} | İsim: ${c.name} | Kategori: ${c.category || 'Genel'} | Açıklama: ${c.description || ''}`,
      )
      .join('\n');

    const prompt = `Sen bir kulüp platformundaki kullanıcı analisti yapay zekasısın. Kullanıcının katıldığı kulüplere bakarak Türkçe bir karakter yorumu ve kulüp önerisi yapman gerekiyor.

Kullanıcının üye olduğu kulüpler:
${joinedList}

Platformdaki diğer kulüpler (kullanıcının üye olmadığı):
${availableList.length > 0 ? availableList : '(Henüz öneri yapılabilecek başka kulüp yok)'}

Görevin:
1. Bu kullanıcının ilgi alanlarını ve karakterini analiz et
2. "Bu ilgi alanına sahip birisi genellikle şu özelliklere sahip olur" tarzında samimi ve pozitif bir karakter yorumu yap
3. "Bunu sevdiysen şunu da sevebilirsin" tarzında öneri cümleleri oluştur
4. Eğer uygun kulüp varsa, en fazla 3 tane kulüp öner (ID'lerini kullanarak)

Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "character": "Kullanıcı hakkında 2-3 cümlelik samimi ve ilham verici karakter yorumu",
  "interests": ["ilgi alanı 1", "ilgi alanı 2", "ilgi alanı 3"],
  "suggestions": ["Öneri cümlesi 1", "Öneri cümlesi 2"],
  "recommendedClubs": [{"id": "kulüp-id", "name": "Kulüp Adı", "category": "Kategori"}]
}

Eğer öneri yapılabilecek kulüp yoksa recommendedClubs boş dizi olsun.`;

    // --- Step 5: Call OpenRouter API ---
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'OpenRouter API key is not configured',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.OPENROUTER_API_URL,
          {
            model: 'openrouter/owl-alpha',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://cluber.app',
              'X-Title': 'Cluber Profile Insight',
            },
          },
        ),
      );

      const content: string =
        response.data?.choices?.[0]?.message?.content ?? '';

      this.logger.log(`OpenRouter raw response: ${content}`);

      // --- Step 6: Parse JSON from response ---
      // Strip markdown code fences if present
      const cleaned = content
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .trim();

      let parsed: ProfileInsightResult;
      try {
        parsed = JSON.parse(cleaned) as ProfileInsightResult;
      } catch {
        this.logger.error(`Failed to parse AI response as JSON: ${cleaned}`);
        throw new InternalServerErrorException(
          'AI response could not be parsed',
        );
      }

      // Ensure all fields exist with safe defaults
      return {
        character: parsed.character ?? '',
        interests: Array.isArray(parsed.interests) ? parsed.interests : [],
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
        recommendedClubs: Array.isArray(parsed.recommendedClubs)
          ? parsed.recommendedClubs
          : [],
      };
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      this.logger.error(`OpenRouter API call failed: ${String(err?.message)}`);
      throw new InternalServerErrorException(
        'AI service is temporarily unavailable',
      );
    }
  }
}
