/*   STEP 1   */
export const leagueID = "1124822402371428352"; // TRL 2024 Season
export const leagueName = "TRL League"; // your league name
export const dues = 100; // (optional) used in template constitution page - UPDATE THIS WITH YOUR ACTUAL DUES
export const dynasty = false; // true for dynasty leagues, false for redraft and keeper - UPDATE THIS IF DYNASTY
export const enableBlog = false; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

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
        "managerID": "325863328037502976",
        "name": "Eric P.", // Replace with actual name
        "location": "Chilbert, AZ", // Update with actual location
        "bio": "The Commish - Leading the league and the deadly swarm in TRL since 2020. Known for making calculated moves and striking when opponents least expect it.",
        "photo": "https://sleepercdn.com/uploads/742b7859c9a6f23cf2649818660a61d2.jpg", // Murder Hornets
        "fantasyStart": 2010,
        "favoriteTeam": "sea", // Update with actual favorite team
        "mode": "Dynasty",
        "favoritePlayer": 639, // Josh Allen - Update with actual preference
        "valuePosition": "RB",
        "rookieOrVets": "Vets",
        "philosophy": "Defense wins championships, but offense fills the stat sheet.",
        "tradingScale": 8,
        "preferredContact": "Text"
    },
    {
        "managerID": "472209479706865664",
        "name": "Jordan D.", // Replace with actual name
        "location": "BFE, AZ", // Update with actual location
        "bio": "Strategic, fierce, and always hunting for the perfect opportunity to troll.",
        "photo": "https://sleepercdn.com/uploads/62e985e5a16225eadb3e640350e20a2e.jpg", // Black Hawk Bones
        "fantasyStart": 2020,
        "favoriteTeam": "dal", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 3294, // Justin Herbert - Update with actual preference
        "valuePosition": "K",
        "rookieOrVets": "Rookies",
        "philosophy": "Strike fast, strike hard, no mercy in the waiver wire.",
        "tradingScale": 8,
        "preferredContact": "Sleeper"
    },
    {
        "managerID": "466113126853505024",
        "name": "Katie P.", // Replace with actual name
        "location": "Regretfully not Kauai, HI", // Update with actual location
        "bio": "Bringing Day of the Dead energy to fantasy football. Sweet victories and bitter defeats, all part of the game.",
        "photo": "https://i.ibb.co/wZssXK7R/E7843835-3481-4-ADE-9818-152-D722-D9659.png", // Add actual photo
        "fantasyStart": 2012,
        "favoriteTeam": "ari", // Update with actual favorite team
        "mode": "Dynasty",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 559, // Kyler Murray - Update with actual preference
        "valuePosition": "WR",
        "rookieOrVets": "Vets",
        "philosophy": "Silent But Deadly.",
        "tradingScale": 2,
        "preferredContact": "Text"
    },
    {
        "managerID": "603451263669043200",
        "name": "Matthew S.", // Replace with actual name
        "location": "Leisure World, AZ", // Update with actual location
        "bio": "DraftGuys drafts my teams",
        "photo": "https://sleepercdn.com/uploads/1bb83a0e2e4ecf7b3ca506fe49f15855.jpg", // Newfoundland Growlers
        "fantasyStart": 2016,
        "favoriteTeam": "ind", // Update with actual favorite team
        "mode": "Rebuild",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 6813, // Stefon Diggs - Update with actual preference
        "valuePosition": "RB",
        "rookieOrVets": "Vets",
        "philosophy": "Propose as many dumb rule changes as possible",
        "tradingScale": 3,
        "preferredContact": "Sleeper"
    },
    {
        "managerID": "467899355982983168",
        "name": "Josh M.", // Replace with actual name
        "location": "Whales Vagina, California", // Update with actual location
        "bio": "Serving up spicy hot takes and even spicier lineup decisions. West Coast best coast for fantasy football.",
        "photo": "https://sleepercdn.com/uploads/927738195c01b864759636d898f4ab85.jpg", // California Burritos
        "fantasyStart": 2020,
        "favoriteTeam": "PIT", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 6777, // Justin Herbert - Update with actual preference
        "valuePosition": "QB",
        "rookieOrVets": "Rookies",
        "philosophy": "Fresh ingredients make the best team.",
        "tradingScale": 7,
        "preferredContact": "Sleeper"
    },
    {
        "managerID": "329117770635546624",
        "name": "Bryce B.", // Replace with actual name
        "location": "His Mom's Other House, AZ", // Update with actual location
        "bio": "Silent but deadly. Operating in the shadows of the waiver wire, striking with precision when others least expect it.",
        "photo": "https://sleepercdn.com/uploads/65a5f6ce6db1b49350c05c95fd59f49f.jpg", // Kyoto Ninjas
        "fantasyStart": 2020,
        "favoriteTeam": "ne", // Update with actual favorite team
        "mode": "Rebuild",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 167, // DK Metcalf - Update with actual preference
        "valuePosition": "WR",
        "rookieOrVets": "Rookies",
        "philosophy": "The way of the ninja: patience, precision, and perfect timing.",
        "tradingScale": 10,
        "preferredContact": "Sleeper"
    },
    {
        "managerID": "604905544913879040",
        "name": "Bo M.", // Replace with actual name
        "location": "Redneck Country, AR", // Update with actual location
        "bio": "Just a dude who loves football.",
        "photo": "https://sleepercdn.com/uploads/3cdb8de81d249e1946d10a1dc60349af.jpg", // Brutal Hogs
        "fantasyStart": 2020,
        "favoriteTeam": "lar", // Update with actual favorite team
        "mode": "Rebuild",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 8150, // Najee Harris - Update with actual preference
        "valuePosition": "RB",
        "rookieOrVets": "Vets",
        "philosophy": "Gonna win it all one of these years.",
        "tradingScale": 7,
        "preferredContact": "Text"
    },
    {
        "managerID": "604905994136424448",
        "name": "Eric D.", // Replace with actual name
        "location": "Westside, AZ", // Update with actual location
        "bio": "Out of this world strategies and otherworldly draft picks. Area 51 has nothing on these lineup decisions.",
        "photo": "https://sleepercdn.com/uploads/fc650b5d4a75e003775512e2ceffade7.jpg", // Southwest Aliens
        "fantasyStart": 2020,
        "favoriteTeam": "cle", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 12524, // Bo Nix - Update with actual preference
        "valuePosition": "QB",
        "rookieOrVets": "Rookies",
        "philosophy": "The truth is out there... and so are championship teams.",
        "tradingScale": 5,
        "preferredContact": "Email"
    },
    {
        "managerID": "474125990310703104",
        "name": "Tim P.", // Replace with actual name
        "location": "Ching Chiang, Thailand", // Update with actual location
        "bio": "The court jester of TRL, but don't let the jokes fool you. Behind the humor lies a sharp fantasy football mind.",
        "photo": "https://sleepercdn.com/uploads/4024194ee0a6785376a806881db3ec52.jpg", // Jesters
        "fantasyStart": 2020,
        "favoriteTeam": "sea", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 2133, // CeeDee Lamb - Update with actual preference
        "valuePosition": "RB",
        "rookieOrVets": "Vets",
        "philosophy": "If you're not having fun, you're doing it wrong.",
        "tradingScale": 9,
        "preferredContact": "WhatsApp"
    },
    {
        "managerID": "604925882020192256",
        "name": "Mile High Melonheads Manager", // Replace with actual name
        "location": "Denver, CO", // Update with actual location
        "bio": "High altitude, high expectations. Thin air makes for clear thinking when it comes to fantasy football decisions.",
        "photo": "https://sleepercdn.com/uploads/fba302c33557e839566b0a537a7d7f8a.jpg", // Mile High Melonheads
        "fantasyStart": 2020,
        "favoriteTeam": "den", // Update with actual favorite team
        "mode": "Rebuild",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 8110, // Bo Nix - Update with actual preference
        "valuePosition": "TE",
        "rookieOrVets": "Rookies",
        "philosophy": "Mile high standards, championship results.",
        "tradingScale": 6,
        "preferredContact": "Text"
    },
    {
        "managerID": "730935879723483136",
        "name": "Evan C.", // Replace with actual name
        "tookOver": 2023, // Replaced Team Sbecker in 2023
        "location": "Seattle, WA", // Update with actual location
        "bio": "New to TRL in 2023, bringing Pacific Northwest precision to fantasy football. Replacing Team Sbecker with fresh energy.",
        "photo": "https://sleepercdn.com/uploads/14c5545661db24ac33e2bdf8e5c28bed.jpg", // Seattle Prestiges
        "fantasyStart": 2023,
        "favoriteTeam": "sea", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 745, // DK Metcalf - Update with actual preference
        "valuePosition": "WR",
        "rookieOrVets": "Rookies",
        "philosophy": "New team, new energy, same championship goals.",
        "tradingScale": 7,
        "preferredContact": "Sleeper"
    },
    {
        "managerID": "474061517147336704",
        "name": "D-Town Swirlies Manager", // Replace with actual name
        "location": "Jerry's World, TX", // Update with actual location
        "bio": "Bringing the swirl to TRL since 2020. Mixing up strategies and creating confusion for opponents since day one.",
        "photo": "https://sleepercdn.com/uploads/89b876a383e6d1a1af584b8da9d59979.jpg", // D-Town Swirlies
        "fantasyStart": 2020,
        "favoriteTeam": "det", // Update with actual favorite team
        "mode": "Win Now",
        "rival": {
            "name": "TBD",
            "link": null,
            "image": "/managers/question.png"
        },
        "favoritePlayer": 7643, // CeeDee Lamb - Update with actual preference
        "valuePosition": "QB",
        "rookieOrVets": "Vets",
        "philosophy": "Keep them guessing, keep them losing.",
        "tradingScale": 7,
        "preferredContact": "Text"
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
    