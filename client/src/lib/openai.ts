import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true // Permite uso no navegador
});

export const generateChatCompletion = async (
  messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>,
  apiKey?: string,
  assistantId?: string // Added assistantId parameter
) => {
  try {
    // Cria uma nova instância do cliente OpenAI com a API key fornecida pelo usuário
    const clientConfig = {
      apiKey: apiKey || import.meta.env.VITE_OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true
    };

    const client = apiKey ? new OpenAI(clientConfig) : openai;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
    });

    return {
      success: true,
      content: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("Erro ao chamar a API OpenAI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao chamar a API",
    };
  }
};

export const generateImage = async (
  prompt: string,
  apiKey?: string
): Promise<{ url: string } | { error: string }> => {
  try {
    // Cria uma nova instância do cliente OpenAI com a API key fornecida pelo usuário
    const clientConfig = {
      apiKey: apiKey || import.meta.env.VITE_OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true
    };

    const client = apiKey ? new OpenAI(clientConfig) : openai;

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data[0].url || "" };
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    return { error: error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem" };
  }
};

export default openai;