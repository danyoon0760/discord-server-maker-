import { NextRequest, NextResponse } from "next/server";

type DiscordRole = {
  id: string;
  name: string;
  tags?: {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: null;
  };
};

type DiscordChannel = {
  id: string;
  type: number;
  name: string;
  parent_id?: string | null;
  position?: number;
};

type DiscordTemplateResponse = {
  name?: string;
  serialized_source_guild?: {
    name?: string;
    roles?: DiscordRole[];
    channels?: DiscordChannel[];
  };
};

type ParsedTemplate = {
  name: string;
  categories: string[];
  channels: string[];
  roles: string[];
  bots: string[];
};

function extractTemplateCode(value: string) {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) || "";
  } catch {
    return trimmed;
  }
}

function formatChannelName(channel: DiscordChannel) {
  if (channel.type === 2) return `🔊 ${channel.name}`;
  if (channel.type === 0) return `#${channel.name}`;
  if (channel.type === 5) return `📢 ${channel.name}`;
  if (channel.type === 15) return `🧵 ${channel.name}`;
  return channel.name;
}

function parseTemplate(data: DiscordTemplateResponse): ParsedTemplate {
  const guild = data.serialized_source_guild;
  const roles = guild?.roles ?? [];
  const channels = guild?.channels ?? [];

  const categoryChannels = channels
    .filter((channel) => channel.type === 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const categoryById = new Map(categoryChannels.map((channel) => [channel.id, channel.name]));

  const nonCategoryChannels = channels
    .filter((channel) => channel.type !== 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const categories = categoryChannels.map((channel) => channel.name);

  const formattedChannels = nonCategoryChannels.map((channel) => {
    const categoryName = channel.parent_id ? categoryById.get(channel.parent_id) : null;
    const name = formatChannelName(channel);
    return categoryName ? `${categoryName} / ${name}` : name;
  });

  const normalRoles = roles
    .filter((role) => role.name !== "@everyone")
    .filter((role) => !role.tags?.premium_subscriber)
    .map((role) => role.name);

  const botRoles = roles
    .filter((role) => role.tags?.bot_id)
    .map((role) => role.name);

  return {
    name: guild?.name || data.name || "디스코드 서버 템플릿",
    categories,
    channels: formattedChannels,
    roles: normalRoles,
    bots: botRoles,
  };
}

export async function GET(request: NextRequest) {
  const template = request.nextUrl.searchParams.get("template") || "";
  const code = extractTemplateCode(template);

  if (!code) {
    return NextResponse.json({ error: "템플릿 링크 또는 코드를 입력해주세요." }, { status: 400 });
  }

  const response = await fetch(`https://discord.com/api/v10/guilds/templates/${encodeURIComponent(code)}`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Discord 템플릿 정보를 가져오지 못했습니다. 링크가 공개 템플릿인지 확인해주세요." },
      { status: response.status },
    );
  }

  const data = (await response.json()) as DiscordTemplateResponse;
  return NextResponse.json(parseTemplate(data));
}
