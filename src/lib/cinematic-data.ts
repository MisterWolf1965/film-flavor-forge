export type CinematicStyle = {
  id: string;
  label: string;
  icon: string;
  description: string;
  visualKeywords: string[];
  moodKeywords: string[];
  subjects: string[];
  locations: string[];
  actions: string[];
  tags: string[];
};

export const STYLES: CinematicStyle[] = [
  {
    id: "70s-gritty",
    label: "70s Gritty",
    icon: "🎞️",
    description: "Taxi Driver meets Serpico. Grain, sweat, neon-lit decay.",
    visualKeywords: ["16mm film grain", "washed-out colors", "handheld camera", "dirty lens flare", "tungsten lighting", "high contrast shadows"],
    moodKeywords: ["paranoid", "desperate", "raw", "unhinged", "gritty realism"],
    subjects: ["a disgraced detective", "a street hustler", "a burned-out journalist", "a taxi driver", "a corrupt politician"],
    locations: ["a rain-soaked alley", "a decrepit motel room", "under a flickering subway light", "a smoky dive bar", "an abandoned parking garage"],
    actions: ["lights a cigarette and stares into the void", "counts crumpled bills under a bare bulb", "pushes through a crowd of faceless strangers", "wipes blood from their lip"],
    tags: ["#70scinema", "#grittyfilm", "#neonnoir", "#analogfilm", "#cinematic", "#microshort"],
  },
  {
    id: "90s-jarmusch",
    label: "90s Jarmusch",
    icon: "☕",
    description: "Dead pans, long silences, beautiful boredom.",
    visualKeywords: ["black and white", "static wide shot", "natural light", "minimal composition", "long take", "35mm still frame"],
    moodKeywords: ["melancholic", "deadpan", "existential", "quietly absurd", "contemplative"],
    subjects: ["two strangers", "a lonely musician", "a night-shift worker", "a wandering poet", "a foreign tourist"],
    locations: ["a near-empty diner at 3AM", "a Memphis motel lobby", "a park bench in winter", "a laundromat", "a bus stop in the rain"],
    actions: ["share an awkward silence over coffee", "stares out a rain-streaked window", "reads a crumpled letter aloud to no one", "waits for something that never comes"],
    tags: ["#jarmusch", "#indiefilm", "#deadpan", "#blackandwhite", "#artcinema", "#microshort"],
  },
  {
    id: "tokyo-noir",
    label: "Tokyo Noir",
    icon: "🌃",
    description: "Neon reflections on wet asphalt. Blade Runner meets Lost in Translation.",
    visualKeywords: ["neon reflections", "rain-soaked streets", "shallow depth of field", "cyan and magenta palette", "anamorphic bokeh", "top-down drone shot"],
    moodKeywords: ["isolated", "hypnotic", "yearning", "electric", "nocturnal"],
    subjects: ["a lone figure in a trench coat", "a hacker", "a heartbroken singer", "a yakuza deserter", "a sleepless photographer"],
    locations: ["Shinjuku's neon alleys", "a capsule hotel", "a rooftop overlooking Shibuya", "an underground ramen bar", "a rain-blurred crosswalk"],
    actions: ["disappears into a crowd of umbrellas", "traces kanji on a foggy window", "receives a cryptic text message", "walks endlessly through neon corridors"],
    tags: ["#tokyonoir", "#neoncinema", "#cyberpunk", "#nightcity", "#japanfilm", "#microshort"],
  },
  {
    id: "prenzlauer-90s",
    label: "Prenzlauer Berg 90s",
    icon: "🏚️",
    description: "Post-wall Berlin. Squats, techno, and raw concrete poetry.",
    visualKeywords: ["Super 8 footage", "desaturated tones", "graffiti-covered walls", "overexposed daylight", "shaky handheld", "documentary style"],
    moodKeywords: ["anarchic", "free", "raw", "hopeful chaos", "underground"],
    subjects: ["a squatter artist", "a reunification kid", "a raver", "a street poet", "an ex-Stasi informant"],
    locations: ["an abandoned factory turned club", "a crumbling courtyard", "a rooftop squat", "Mauerpark at dawn", "a graffiti-covered stairwell"],
    actions: ["spray-paints a wall with their manifesto", "dances alone in an empty warehouse", "shares a cigarette on a fire escape", "stares at the wall's remains"],
    tags: ["#berlin90s", "#prenzlauerberg", "#postwall", "#techno", "#undergroundfilm", "#microshort"],
  },
  {
    id: "postapocalyptic",
    label: "Post-Apocalyptic",
    icon: "🔥",
    description: "Fury Road. Dust, chrome, and survival at the edge of civilization.",
    visualKeywords: ["orange and teal grade", "wide desert panorama", "dust particles in light", "practical explosions", "extreme close-ups", "overexposed sky"],
    moodKeywords: ["savage", "primal", "relentless", "desperate hope", "feral"],
    subjects: ["a road warrior", "a scavenger child", "a war-painted warlord", "a mute drifter", "a fuel-hoarding hermit"],
    locations: ["an endless desert highway", "a wrecked tanker fortress", "a dried-out riverbed", "a rusted vehicle graveyard", "a sandstorm's eye"],
    actions: ["revs a war-rig engine and screams into dust", "trades bullets for water", "paints their face for the final ride", "watches the horizon burn"],
    tags: ["#postapocalyptic", "#madmax", "#furyroad", "#desertcinema", "#survivalfilm", "#microshort"],
  },
  {
    id: "scifi-alien",
    label: "Sci-Fi Alien",
    icon: "👾",
    description: "Alien meets 2001. Claustrophobic corridors and cosmic dread.",
    visualKeywords: ["cold blue lighting", "steam and fog", "CRT monitor glow", "practical sets", "slow dolly push", "silhouette against airlock"],
    moodKeywords: ["dread", "claustrophobic", "eerie calm", "cosmic horror", "industrial isolation"],
    subjects: ["a lone crew member", "an android with a secret", "a biologist studying a specimen", "a navigator losing sanity", "a corporate officer"],
    locations: ["a derelict spacecraft corridor", "a cryo-chamber", "the bridge of a deep-space freighter", "an alien egg chamber", "an observation deck facing the void"],
    actions: ["hears something breathing in the vents", "watches a blip approach on radar", "opens a door that should have stayed sealed", "floats in zero gravity, alone"],
    tags: ["#scifi", "#alienfilm", "#cosmichorror", "#spacecinema", "#retroscifi", "#microshort"],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePrompt(style: CinematicStyle) {
  const visual = pick(style.visualKeywords);
  const mood = pick(style.moodKeywords);
  const subject = pick(style.subjects);
  const location = pick(style.locations);
  const action = pick(style.actions);

  const prompt = `${visual}. ${subject} in ${location} ${action}. The mood is ${mood}.`;

  const imagePrompt = `Cinematic still frame, ${visual}, ${subject} in ${location}, ${action}, ${mood} atmosphere, ultra high resolution, movie scene, dramatic lighting, film photography`;

  const socialDescription = `🎬 ${style.icon} ${style.label} | A micro short film moment.\n\n"${subject} in ${location}... ${action}."\n\nShot in ${visual} style. The air is thick with ${mood} energy.\n\n${style.tags.join(" ")}`;

  return { prompt, imagePrompt, socialDescription, tags: style.tags, style };
}

export type GeneratedContent = ReturnType<typeof generatePrompt> & {
  id: string;
  imageUrl?: string;
  createdAt: Date;
};
