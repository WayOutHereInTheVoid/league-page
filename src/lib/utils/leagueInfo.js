/*   STEP 1   */
export const leagueID = "1388734211501883392"; // TRL 2025 Season
export const leagueName = "TRL League"; // your league name
export const dues = 250; // (optional) used in template constitution page - UPDATE THIS WITH YOUR ACTUAL DUES
export const dynasty = false; // true for dynasty leagues, false for redraft and keeper - UPDATE THIS IF DYNASTY
export const enableBlog = false; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

// Draft Configuration
export const draftConfig = {
  // 2025 Draft: Sunday August 31, 2025 at 12:00 PM MST (Phoenix time)
  // Note: Phoenix, AZ does not observe daylight saving time, so MST is year-round (UTC-7)
  year: 2026,
  month: 8, // August (0-indexed: 0=Jan, 1=Feb, ..., 7=Aug, ..., 11=Dec)
  day: 6,
  hour: 12, // 12 PM
  minute: 0,
  timezone: "MST", // Mountain Standard Time (UTC-7)
  // Formatted date string for easy reading
  dateString: "Sunday, September 6, 2026 at 12:00 PM MST",
  // Enable draft countdown during preseason
  enableDraftCountdown: true,
};

// Helper function to create the draft Date object
export function getDraftDate() {
  // Create draft date: Sunday, August 31, 2025 at 12:00 PM MST
  // MST is UTC-7, so 12:00 PM MST = 7:00 PM UTC (19:00 UTC)
  return new Date("2026-09-06T19:00:00.000Z"); // ISO string in UTC
}

/*   STEP 2   */
export const homepageText = `
  <p>Welcome to the TRL Fantasy Football League! We're a competitive league that has been battling it out since 2020.</p>
  <p>Our league features 12 dedicated managers who bring their A-game every season. From the Murder Hornets to the Seattle Prestiges, each team has its own unique personality and strategy.</p>
  <p>Whether you're looking for trades, checking out the latest power rankings, or diving into our league history, you'll find everything you need right here on our league page.</p>
  <p>May the best team win, and remember - it's not just about winning, it's about having fun and building lasting friendships through our shared love of fantasy football!</p>
`;

/*   STEP 3   */
/*
TRL League Manager Configuration
All 12 managers configured with complete profile data using managerID (modern format)
*/

// To omit an optional field, set it's value to null

export const managers = [
  {
    managerID: "325863328037502976",
    name: "Eric P.", // Replace with actual name
    location: "Chilbert, AZ", // Update with actual location
    bio: "The Commish - Leading the league and the deadly swarm in TRL since 2010.",
    photo: "/managers/EricP.jpg", // Murder Hornets
    fantasyStart: 2010,
    favoriteTeam: "sea", // Update with actual favorite team
    mode: "Dynasty",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 639, // Josh Allen - Update with actual preference
    valuePosition: "RB",
    rookieOrVets: "Vets",
    philosophy: "Our sting is swift, our poison is fantasy points.",
    tradingScale: 8,
    preferredContact: "Text",
  },
  {
    managerID: "1256621073047244800",
    name: "George K.", // Replace with actual name
    location: "Wild West, TX", // Update with actual location
    bio: "TBD",
    photo: "/managers/George.jpg", // Black Hawk Bones
    fantasyStart: 2025,
    favoriteTeam: "dal", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 3294, // Justin Herbert - Update with actual preference
    valuePosition: "K",
    rookieOrVets: "Rookies",
    philosophy: "Everything's bigger in Texas, including our lead.",
    tradingScale: 8,
    preferredContact: "Sleeper",
  },
  {
    managerID: "466113126853505024",
    name: "Katie P.", // Replace with actual name
    location: "Regretfully not Kauai, HI", // Update with actual location
    bio: "Bringing Day of the Dead energy to fantasy football. Sweet victories and bitter defeats, all part of the game.",
    photo: "/managers/Kate.jpg", // Add actual photo
    fantasyStart: 2012,
    favoriteTeam: "ari", // Update with actual favorite team
    mode: "Dynasty",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 559, // Kyler Murray - Update with actual preference
    valuePosition: "WR",
    rookieOrVets: "Vets",
    philosophy: "Silent But Deadly.",
    tradingScale: 2,
    preferredContact: "Text",
  },
  {
    managerID: "1388734211501883392",
    name: "Bryce", // Replace with actual name
    location: "East Valley Steam Tower", // Update with actual location
    bio: "TBD",
    photo: "/managers/Matt.jpg", // Newfoundland Growlers
    fantasyStart: 2016,
    favoriteTeam: "ne", // Update with actual favorite team
    mode: "Rebuild",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 6813, // Stefon Diggs - Update with actual preference
    valuePosition: "RB",
    rookieOrVets: "Rookies",
    philosophy: "TRADE TRADE TRADE",
    tradingScale: 10,
    preferredContact: "Text",
  },
  {
    managerID: "467899355982983168",
    name: "Josh M.", // Replace with actual name
    location: "Whales V, California", // Update with actual location
    bio: "TBD.",
    photo: "/managers/Josh.jpg", // California Burritos
    fantasyStart: 2020,
    favoriteTeam: "PIT", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 6777, // Justin Herbert - Update with actual preference
    valuePosition: "QB",
    rookieOrVets: "Rookies",
    philosophy: "We roll deep and are stuffed with fantasy gold.",
    tradingScale: 5,
    preferredContact: "Sleeper",
  },
  {
    managerID: "1004928205519728640",
    name: "Team FoodMafia", // Replace with actual name
    location: "West Coast Best Coast, CA", // Update with actual location
    bio: "He knows his trivia, we'll see if his fantasy skills are up to par",
    photo: "/managers/Paul.jpg", // FoodMafia
    fantasyStart: 2025,
    favoriteTeam: "ne", // Update with actual favorite team
    mode: "Rebuild",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 167, // DK Metcalf - Update with actual preference
    valuePosition: "WR",
    rookieOrVets: "Rookies",
    philosophy:
      "Making offers you can't refuse...and trades you probably should have.",
    tradingScale: 10,
    preferredContact: "Sleeper",
  },
  {
    managerID: "604905544913879040",
    name: "Bo M.", // Replace with actual name
    location: "Redneck Country, AR", // Update with actual location
    bio: "Just a dude who loves football.",
    photo: "/managers/Bo.jpg", // Brutal Hogs
    fantasyStart: 2020,
    favoriteTeam: "lar", // Update with actual favorite team
    mode: "Rebuild",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 8150, // Najee Harris - Update with actual preference
    valuePosition: "RB",
    rookieOrVets: "Vets",
    philosophy: "Oink if you love a good brutal beatdown.",
    tradingScale: 7,
    preferredContact: "Text",
  },
  {
    managerID: "726992702184443904",
    name: "Kris", // Replace with actual name
    location: "West Coast, Best Coast", // Update with actual location
    bio: "TBD.",
    photo: "/managers/EricD.jpg", // Southwest Aliens
    fantasyStart: 2026,
    favoriteTeam: "den", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 12524, // Bo Nix - Update with actual preference
    valuePosition: "QB",
    rookieOrVets: "Rookies",
    philosophy: "We come in peace...and leave with the trophy.",
    tradingScale: 5,
    preferredContact: "Email",
  },
  {
    managerID: "474125990310703104",
    name: "Tim P.", // Replace with actual name
    location: "Ching Chiang, Thailand", // Update with actual location
    bio: "The court jester of TRL, but don't let the jokes fool you. Behind the humor lies a sharp fantasy football mind.",
    photo: "/managers/Tim.jpg", // Jesters
    fantasyStart: 2020,
    favoriteTeam: "sea", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 2133, // CeeDee Lamb - Update with actual preference
    valuePosition: "RB",
    rookieOrVets: "Vets",
    philosophy: "A joke until we laugh all the way to the bank.",
    tradingScale: 9,
    preferredContact: "WhatsApp",
  },
  {
    managerID: "719514439803547648",
    name: "Team PR790", // Replace with actual name
    location: "AR-kansas", // Update with actual location
    bio: "A new manager joining in 2025 to replace the retired Mile High Melonheads.",
    photo: "/managers/question.png", // Mile High Melonheads
    fantasyStart: 2025,
    favoriteTeam: "den", // Update with actual favorite team
    mode: "Rebuild",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 8110, // Bo Nix - Update with actual preference
    valuePosition: "TE",
    rookieOrVets: "Rookies",
    philosophy: "TBD...",
    tradingScale: 6,
    preferredContact: "Text",
  },
  {
    managerID: "730935879723483136",
    name: "Evan C.", // Replace with actual name
    tookOver: 2023, // Replaced Team Sbecker in 2023
    location: "Seattle, WA", // Update with actual location
    bio: "New to TRL in 2023, bringing Pacific Northwest precision to fantasy football. Replacing Team Sbecker with fresh energy.",
    photo: "/managers/Evan.jpg", // Seattle Prestiges
    fantasyStart: 2023,
    favoriteTeam: "sea", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 745, // DK Metcalf - Update with actual preference
    valuePosition: "WR",
    rookieOrVets: "Rookies",
    philosophy: "Not just a team, it's a lifestyle. A winning lifestyle.",
    tradingScale: 7,
    preferredContact: "Sleeper",
  },
  {
    managerID: "474061517147336704",
    name: "Shawn G.", // Replace with actual name
    location: "Jerry's World, TX", // Update with actual location
    bio: "Bringing the swirl to TRL since 2010. Mixing up strategies and creating confusion for opponents since day one.",
    photo: "/managers/Shawn.jpg", // D-Town Swirlies
    fantasyStart: 2010,
    favoriteTeam: "det", // Update with actual favorite team
    mode: "Win Now",
    rival: {
      name: "TBD",
      link: null,
      image: "/managers/question.png",
    },
    favoritePlayer: 7643, // CeeDee Lamb - Update with actual preference
    valuePosition: "QB",
    rookieOrVets: "Vets",
    philosophy: "Consider this your fantasy football wake-up call.",
    tradingScale: 7,
    preferredContact: "Text",
  },
];

/*   !!  !!  IMPORTANT  !!  !! */
/*
  Below is the most up to-date version of a manager. Please leave this commented out
  and don't delete it. This will be updated if any fields are added, removed or changed
  and will allow updates without causing merge conflicts
  */

// {
//   "roster": 3,  // (DEPRECATED! Don't use this anymore) ID of the roster that the manager manages (look at the order of the power rankings graph)
//   "managerID": "12345678",  // the user's manager ID, go to https://api.sleeper.app/v1/league/<your_league_id>/users to find user IDs (you can use older leagueIDs to find user IDs for managers that are no longer in the league)
//   "name": "Your Name",
//   "tookOver": 2020, // (DEPRECATED! You don't need to use this anymore) (optional) used if a manager took over a team, delete this line or change to null otherwise
//   "location": "Brooklyn", // (optional)
//   "bio": "Lorem ipsum...",
//   "photo": "/managers/name.jpg", // square ratio recommended (no larger than 500x500)
//   "fantasyStart": 2014, // (optional) when did the manager start playing fantasy football
//   "favoriteTeam": "nyj", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
//   "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
//   "rival": {
//     name: "Rival", // Can be anything (usually your rival's name)
//     link: 6, // manager array number within this array, or null to link back to all managers page
//     image: "/managers/rival.jpg", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
//   },
//   "favoritePlayer": 1426, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
//   "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
//   "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
//   "philosophy": "Your fantasy team's philosophy", // (optional)
//   "tradingScale": 10, // 1 - 10 (optional)
//   "preferredContact": "Text",  // (optional) 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
// },

/* TRL BRAND DATA */
/* Keyed by Sleeper roster_id (1–12). Managers change; roster slots don't. */

export const trlTeams = {
  1: {
    teamName: "Chilbert Murder Hornets",
    slug: "murder-hornets",
    city: "Chilbert",
    tagline: "Our Sting Is Swift, Our Poison Is Fantasy Points",
    founded: "2020",
    rival: "Lone Star Legends",
    motto: "Strike Fast. Strike Often.",
    lore: "The Murder Hornets have been the backbone of TRL since the league's founding. Commissioner Eric Patterson's squad is known for relentless aggression and a sting that opponents rarely see coming.",
    colors: {
      primary:   "#FFD700", // Hornet Gold
      secondary: "#1A1A2E", // Dark Navy
      accent:    "#E63946", // Danger Red
      dark:      "#0D0D0D", // Pit Black
      light:     "#FFFDE7", // Pale Yellow
    },
    assets: {
      logo:         "/teams/murder-hornets/logo.png",
      banner:       "/teams/murder-hornets/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  2: {
    teamName: "Lone Star Legends",
    slug: "lone-star",
    city: "Wild West",
    tagline: "Everything's Bigger in Texas, Including Our Lead",
    founded: "2025",
    rival: "Chilbert Murder Hornets",
    motto: "One Star. All Championship.",
    lore: "The Lone Star Legends rode into TRL in 2025 with George Kirby's Texas-sized ambitions. This fresh franchise brings a shoot-first, ask-questions-later trade philosophy to the league.",
    colors: {
      primary:   "#002868", // Lone Star Blue
      secondary: "#BF0A30", // Texas Red
      accent:    "#D4AF37", // Star Gold
      dark:      "#1A0A00", // Dark Earth
      light:     "#F5F0E8", // Bone White
    },
    assets: {
      logo:         "/teams/lone-star/logo.png",
      banner:       "/teams/lone-star/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  3: {
    teamName: "AZ Sugar Skulls",
    slug: "sugar-skulls",
    city: "Arizona",
    tagline: "Silent But Deadly",
    founded: "2020",
    rival: "Chilbert Murder Hornets",
    motto: "Sweet on the Outside. Lethal Within.",
    lore: "Katie Patterson's Sugar Skulls blend Day of the Dead aesthetics with a ruthless fantasy football mindset. Underestimate them at your own peril — they've been haunting opponents since 2011.",
    colors: {
      primary:   "#E91E8C", // Fiesta Pink
      secondary: "#7B2D8B", // Skull Purple
      accent:    "#FF6B35", // Marigold Orange
      dark:      "#1A0030", // Midnight
      light:     "#FFF0F8", // Blush
    },
    assets: {
      logo:         "/teams/sugar-skulls/logo.png",
      banner:       "/teams/sugar-skulls/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  4: {
    teamName: "East Valley Yetis",
    slug: "yetis",
    city: "East Valley",
    tagline: "TRADE TRADE TRADE",
    founded: "2026",
    rival: "D-Town Swirlies",
    motto: "Unseen. Unstoppable.",
    lore: "Bryce Baker took the helm in 2026 and immediately put the Yetis franchise on notice — trades are flying and rosters are being rebuilt from the ground up. The Yetis are hungry and the offseason never ends.",
    colors: {
      primary:   "#00B4D8", // Glacier Blue
      secondary: "#023E8A", // Deep Freeze Navy
      accent:    "#CAF0F8", // Arctic Frost
      dark:      "#03045E", // Abyss
      light:     "#F0F8FF", // Snow White
    },
    assets: {
      logo:         "/teams/yetis/logo.png",
      banner:       "/teams/yetis/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  5: {
    teamName: "California Burritos",
    slug: "burritos",
    city: "Whales Valley",
    tagline: "We Roll Deep and Are Stuffed With Fantasy Gold",
    founded: "2020",
    rival: "Food Mafia",
    motto: "Wrapped Tight. Packed With Points.",
    lore: "Josh Martinez brought California cool and a stuffed-to-the-brim roster philosophy to TRL. The Burritos have been rolling through defenses since 2017, proving the best things in fantasy come wrapped up.",
    colors: {
      primary:   "#D62828", // Salsa Red
      secondary: "#F77F00", // Tortilla Orange
      accent:    "#FCBF49", // Cheese Gold
      dark:      "#2B1A00", // Chipotle Brown
      light:     "#FFF8EC", // Sour Cream
    },
    assets: {
      logo:         "/teams/burritos/logo.png",
      banner:       "/teams/burritos/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  6: {
    teamName: "Food Mafia",
    slug: "food-mafia",
    city: "West Coast",
    tagline: "Making Offers You Can't Refuse",
    founded: "2025",
    rival: "California Burritos",
    motto: "The Family That Scores Together Stays Together.",
    lore: "Paul Duchemin arrived in TRL in 2025 and immediately started running the league like a family business. The Food Mafia trades aggressively and never sleeps — they'll make you an offer you can't refuse.",
    colors: {
      primary:   "#C62828", // Mafia Red
      secondary: "#1B1B1B", // Blackout
      accent:    "#D4AF37", // Don's Gold
      dark:      "#0A0A0A", // Omertà Black
      light:     "#F5F0E0", // Linens
    },
    assets: {
      logo:         "/teams/food-mafia/logo.png",
      banner:       "/teams/food-mafia/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  7: {
    teamName: "Brutal Hogs",
    slug: "brutal-hogs",
    city: "Redneck Country",
    tagline: "Oink If You Love a Good Brutal Beatdown",
    founded: "2020",
    rival: "East Valley Yetis",
    motto: "Root Deep. Run Hard.",
    lore: "Bo Meyers brought Arkansas grit to TRL's fantasy gridiron in 2018. The Brutal Hogs don't finesse — they line up, dig in, and grind out wins with blue-collar fantasy football every single week.",
    colors: {
      primary:   "#9D2235", // Razorback Red
      secondary: "#FFFFFF", // White
      accent:    "#C5A028", // Farmhand Gold
      dark:      "#1A0008", // Midnight Barn
      light:     "#FFF5F5", // Pale Pink
    },
    assets: {
      logo:         "/teams/brutal-hogs/logo.png",
      banner:       "/teams/brutal-hogs/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  8: {
    teamName: "Bird Gang",
    slug: "bird-gang",
    city: "West Coast",
    tagline: "We Come in Peace and Leave With the Trophy",
    founded: "2026",
    rival: "Lone Star Legends",
    motto: "Fly High. Score Higher.",
    lore: "Kris joined TRL in 2026, inheriting a roster with plenty of upside and rebranding it under the Bird Gang banner. With a Win Now mentality, the flock is circling for its first TRL championship.",
    colors: {
      primary:   "#004C54", // Midnight Teal
      secondary: "#A5ACAF", // Feather Silver
      accent:    "#ACC0C6", // Sky Blue
      dark:      "#001F22", // Deep Forest
      light:     "#F0F5F6", // Cloud White
    },
    assets: {
      logo:         "/teams/bird-gang/logo.png",
      banner:       "/teams/bird-gang/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  9: {
    teamName: "Jesters",
    slug: "jesters",
    city: "Ching Chiang",
    tagline: "A Joke Until We Laugh All the Way to the Bank",
    founded: "2020",
    rival: "AZ Sugar Skulls",
    motto: "No Joke: We Win.",
    lore: "Tim Patterson has been making opponents laugh — then cry — since TRL's founding in 2020. The Jesters may come off as the league's entertainers, but behind every punchline is a sharp fantasy mind gunning for glory.",
    colors: {
      primary:   "#7B2D8B", // Jester Purple
      secondary: "#FFD700", // Fool's Gold
      accent:    "#E63946", // Crimson Cap
      dark:      "#1A001F", // Velvet Black
      light:     "#FFF5FF", // Pale Lilac
    },
    assets: {
      logo:         "/teams/jesters/logo.png",
      banner:       "/teams/jesters/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  10: {
    teamName: "Gamblers",
    slug: "gamblers",
    city: "AR-Kansas",
    tagline: "The House Always Wins",
    founded: "2025",
    rival: "Brutal Hogs",
    motto: "All In. Every Week.",
    lore: "Rob joined TRL in 2025 carrying on the Gamblers franchise. With high risk and higher reward as the operating philosophy, every roster move is a calculated bet on winning it all.",
    colors: {
      primary:   "#FCC900", // Jackpot Gold
      secondary: "#6502D8", // Electric Violet
      accent:    "#320176", // Midnight Purple
      dark:      "#030201", // Pit Boss Black
      light:     "#FDF5E1", // Bone Cream
    },
    assets: {
      logo:         "/teams/gamblers/logo.png",
      banner:       "/teams/gamblers/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  11: {
    teamName: "Seattle Prestige",
    slug: "prestige",
    city: "Seattle",
    tagline: "Not Just a Team, It's a Winning Lifestyle",
    founded: "2020",
    rival: "D-Town Swirlies",
    motto: "Precision Over Passion. Always.",
    lore: "The Prestige franchise has been a TRL cornerstone since 2013. Evan Conley took over in 2023 and has kept the Pacific Northwest legacy alive — methodical, data-driven, and quietly dangerous every season.",
    colors: {
      primary:   "#002244", // Seahawks Navy
      secondary: "#69BE28", // Action Green
      accent:    "#A5ACAF", // Wolf Grey
      dark:      "#001122", // Pacific Deep
      light:     "#F0F4F0", // Cascade Mist
    },
    assets: {
      logo:         "/teams/prestige/logo.png",
      banner:       "/teams/prestige/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
  12: {
    teamName: "D-Town Swirlies",
    slug: "swirlies",
    city: "Jerry's World",
    tagline: "Consider This Your Fantasy Football Wake-Up Call",
    founded: "2020",
    rival: "Seattle Prestige",
    motto: "Swirl Up. Never Down.",
    lore: "Shawn Golden has been spinning opponents dizzy since TRL's founding in 2020. The D-Town Swirlies are one of the league's most consistent threats, combining veteran savvy with an unpredictable swirl of strategies that keeps every opponent guessing.",
    colors: {
      primary:   "#003594", // Cowboys Blue
      secondary: "#041E42", // Midnight Navy
      accent:    "#869397", // Silver Star
      dark:      "#020B1A", // Night Sky
      light:     "#F0F2F5", // Ice Grey
    },
    assets: {
      logo:         "/teams/swirlies/logo.png",
      banner:       "/teams/swirlies/banner.jpg",
      uniformHome:  null,
      uniformAway:  null,
      stadium:      null,
      field:        null,
    },
  },
};

export const slugToRosterId = Object.fromEntries(
  Object.entries(trlTeams).map(([id, team]) => [team.slug, parseInt(id)])
);
