/*   STEP 1   */
export const leagueID = "1124822402371428352"; // your league ID
export const leagueName = "The Real League"; // your league name
export const dues = 200; // (optional) used in template constitution page
export const dynasty = false; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = true; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
`;

/*   STEP 3   */
/*
3 managers as an example. Uncomment (remove the //) before each line to make it live code
If you're having trouble, reference the Training Wheels' Manager Section
https://github.com/nmelhado/league-page/blob/master/TRAINING_WHEELS.md#ii-adding-managers-and-changing-the-homepage-text
*/

// To omit an optional field, set it's value to null

export const managers = [
  {
    "managerID": "325863328037502976",
    "name": "Mt Fuji Murder Hornets",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "329117770635546624",
    "name": "Kyoto Ninjas",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "466113126853505024",
    "name": "Sonora Sugar Skulls",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "467899355982983168",
    "name": "California Burritos",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "472209479706865664",
    "name": "Ghost Riders",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "474061517147336704",
    "name": "D-Town Swirlies",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "474125990310703104",
    "name": "Rochester Jesters",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "603451263669043200",
    "name": "Newfoundland Growlers",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "604905544913879040",
    "name": "Brutal Hogs",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "604905994136424448",
    "name": "Prescott Valley Aliens",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "604925882020192256",
    "name": "Mile-High Melonheads",
    "tookOver": null,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  },
  {
    "managerID": "730935879723483136",
    "name": "Seattle Prestiges",
    "tookOver": 2023,
    "location": "<VARIABLE>",
    "bio": "<VARIABLE>",
    "photo": null,
    "fantasyStart": "<VARIABLE>",
    "favoriteTeam": "<VARIABLE>",
    "favoritePlayer": null,
    "valuePosition": "<VARIABLE>",
    "rookieOrVets": "<VARIABLE>",
    "philosophy": "<VARIABLE>",
    "tradingScale": "<VARIABLE>",
    "preferredContact": "<VARIABLE>"
  }
]
  
  
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
    
