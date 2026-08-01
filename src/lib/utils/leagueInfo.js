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
