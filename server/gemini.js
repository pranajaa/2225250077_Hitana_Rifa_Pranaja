// Penghubung ke Google Gemini API (SDK resmi @google/genai). API key hanya dibaca dari server/.env.
// Semua kegagalan diubah menjadi AiError dengan kode yang dipahami aplikasi (lihat data/ai.json → messages).

export const AI_CODES = ['quota', 'busy', 'upstream', 'badkey', 'blocked', 'server', 'nokey'];
const SIMULATABLE = ['quota', 'busy', 'upstream', 'badkey', 'blocked', 'server'];

export class AiError extends Error {
  /** @param {string} code  salah satu AI_CODES  @param {string} [detail]  hanya untuk log terminal */
  constructor(code, detail = '') {
    super(detail || code);
    this.code = code;
  }
}

const NETWORK_CODES = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET', 'ENETUNREACH'];

/** Mengubah error dari SDK/jaringan menjadi AiError. Diekspor untuk diuji. */
export function mapGeminiError(err) {
  if (err instanceof AiError) return err;
  const status = Number(err?.status ?? err?.code);
  const text = String(err?.message ?? '');
  if (err?.name === 'AbortError' || err?.name === 'TimeoutError') return new AiError('busy', 'batas waktu habis');
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text)) return new AiError('quota', 'kuota Gemini habis (429)');
  if (status === 401 || status === 403 || /API[_ ]?key/i.test(text)) return new AiError('badkey', 'API key ditolak Google');
  if (status === 404) return new AiError('server', 'model tidak ditemukan — periksa GEMINI_MODEL (npm run models)');
  if (status >= 500) return new AiError('busy', `Gemini sibuk (${status})`);
  if (status === 400) return new AiError('server', `permintaan ditolak Gemini (400): ${text.slice(0, 160)}`);
  const cause = err?.cause?.code ?? err?.code;
  if (NETWORK_CODES.includes(cause) || /fetch failed|network/i.test(text)) {
    return new AiError('upstream', 'server tidak bisa menghubungi Google (internet?)');
  }
  return new AiError('server', text.slice(0, 160) || 'galat tidak dikenal');
}

/** Mengambil teks jawaban; melempar AiError 'blocked' bila ditahan filter keamanan. */
export function readResponse(response) {
  if (response?.promptFeedback?.blockReason) throw new AiError('blocked', `diblokir: ${response.promptFeedback.blockReason}`);
  const finish = response?.candidates?.[0]?.finishReason;
  if (finish === 'SAFETY' || finish === 'PROHIBITED_CONTENT' || finish === 'BLOCKLIST') {
    throw new AiError('blocked', `diblokir: ${finish}`);
  }
  const text = typeof response?.text === 'string' ? response.text : '';
  if (!text.trim()) throw new AiError('server', `jawaban kosong (finishReason: ${finish ?? '-'})`);
  return text;
}

/**
 * Membuat klien Gemini.
 * @param {{ apiKey: string, model: string, fallbackModel?: string, timeoutMs?: number,
 *           thinkingBudget?: number|null, simulate?: string, sdk?: object }} options
 *   `sdk` = objek pengganti GoogleGenAI (untuk uji); `simulate` = kode error tiruan (AI_SIMULATE).
 */
export async function createGemini(options) {
  // 25 detik per model: model utama + cadangan masih muat dalam batas tunggu aplikasi (60 detik, js/ai.js).
  const { apiKey, model, fallbackModel, timeoutMs = 25000, thinkingBudget = null, simulate = '' } = options;
  let client = options.sdk;
  if (!client && apiKey) {
    const { GoogleGenAI } = await import('@google/genai');
    client = new GoogleGenAI({ apiKey });
  }

  async function callModel(name, request) {
    const config = {
      systemInstruction: request.system,
      temperature: request.temperature ?? 0.3,
      maxOutputTokens: request.maxTokens,
      abortSignal: AbortSignal.timeout(timeoutMs),
    };
    if (request.schema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = request.schema;
    }
    if (Number.isFinite(thinkingBudget)) config.thinkingConfig = { thinkingBudget };
    try {
      const response = await client.models.generateContent({ model: name, contents: request.contents, config });
      return readResponse(response);
    } catch (err) {
      throw mapGeminiError(err);
    }
  }

  return {
    model,
    /**
     * @param {{ system: string, contents: object[], maxTokens: number, schema?: object, temperature?: number }} request
     * @returns {Promise<string>} teks jawaban (JSON mentah bila `schema` diisi)
     */
    async generate(request) {
      if (SIMULATABLE.includes(simulate)) throw new AiError(simulate, `simulasi AI_SIMULATE=${simulate}`);
      if (!client) throw new AiError('nokey', 'GEMINI_API_KEY belum diisi');
      try {
        return await callModel(model, request);
      } catch (err) {
        // Model cadangan dicoba sekali bila model utama kehabisan kuota atau sibuk.
        if (fallbackModel && fallbackModel !== model && (err.code === 'quota' || err.code === 'busy')) {
          return callModel(fallbackModel, request);
        }
        throw err;
      }
    },
  };
}
