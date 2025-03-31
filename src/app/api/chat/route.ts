import { NextResponse } from "next/server";
import OpenAI from "openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not configured" },
        { status: 401 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
