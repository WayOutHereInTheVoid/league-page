# Fantasy Football League Page

This is a customizable, mobile-first fantasy football league homepage that any league can use, built with SvelteKit. It's designed to be easily configurable and deployable, allowing you to have a professional-looking league website with minimal effort. This project is based on the original work by [nmelhado](https://github.com/nmelhado/league-page).

## Features

- **Manager Profiles:** View detailed profiles for each manager in the league.
- **Matchups:** See weekly matchup results and brackets.
- **Power Rankings:** Check out the latest power rankings.
- **Standings:** View the current league standings.
- **Rosters:** Browse the rosters for each team.
- **Records:** Explore all-time and per-season records.
- **Drafts:** Review past draft results.
- **Transactions:** Keep up with the latest trades and waiver wire pickups.
- **Blog:** An optional blog feature, powered by Contentful.
- **Constitution:** A dedicated page for your league's constitution.
- **Rivalry:** Compare head-to-head stats against your rivals.
- **Awards:** A page to showcase league awards.

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/)
- **UI:** [Svelte Material UI (SMUI)](https://sveltematerialui.com/)
- **Charting:** [ApexCharts](https://apexcharts.com/)
- **Deployment:** [Vercel](https://vercel.com/) or [Docker](https://www.docker.com/)
- **Blog (Optional):** [Contentful](https://www.contentful.com/)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 6.0.0 or higher

## Getting Started

To get a local copy up and running, follow these simple steps.

1.  **Clone the repo**
    ```sh
    git clone https://github.com/nmelhado/league-page.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd league-page
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Run the development server**
    ```sh
    npm run dev
    ```
    Now, open your browser and navigate to `http://localhost:5173` to see the application.

## Configuration

The main configuration for your league is done in a single file: `src/lib/utils/leagueInfo.js`. Open this file to customize your league's settings.

### Basic Information

At the top of the file, you'll find the following variables to set your basic league information:

- `leagueID`: Your league's Sleeper ID.
- `leagueName`: Your league's name.
- `dues`: The amount of league dues.
- `dynasty`: Set to `true` for dynasty leagues, `false` for redraft/keeper.
- `enableBlog`: Set to `true` to enable the blog feature. Requires Contentful environment variables.

### Homepage Text

The `homepageText` variable allows you to set the introductory text on the homepage using HTML.

### Manager Profiles

The `managers` array is where you'll configure the profiles for each manager in your league. Each manager is an object with several properties to customize, such as:

- `managerID`: The manager's Sleeper ID.
- `name`: The manager's name.
- `location`: The manager's location.
- `bio`: A short biography.
- `photo`: A URL to a profile picture.
- and many more...

The file contains a commented-out template for a manager object that you can use as a reference.

## Build and Deployment

### Building the Project

To build the application for production, run the following command:

```sh
npm run build
```

This will create a production-ready version of your application in the `build` directory.

### Deployment

This project is configured for easy deployment on Vercel or with Docker.

#### Vercel

The easiest way to deploy your application is to use [Vercel](https://vercel.com/). The project is pre-configured to work with Vercel's Node.js 20.x runtime. Simply link your GitHub repository to a new Vercel project, and it will be deployed automatically.

#### Docker

If you prefer to use Docker, you can build and run a Docker image of the application.

1.  **Build the Docker image**
    ```sh
    npm run docker-build
    ```
2.  **Run the Docker container**
    ```sh
    npm run docker-run
    ```
    This will start the application on `http://localhost:3000`.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

This project is a fork of the original [league-page](https://github.com/nmelhado/league-page) by Nicholas Melhado. We are grateful for his work and the contributions of all the developers who have made this project possible.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Requestt
