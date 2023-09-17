[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/alYGiV?referralCode=HqjCnM)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/LaCrak27/RailwayBot">
    <img src="https://devicons.railway.app/i/railway-dark.svg" alt="Logo" width="80" height="80">
  </a>

<h1 align="center">RailwayBot</h1>

  <p align="center">
    A companion bot for railway users that offers better deployment updates as well as usage stats.
    <br />
    <a href="https://github.com/LaCrak27/RailwayBot/issues">Report Bug/Request features</a>
  </p>
  
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-railwaybot">About RailwayBot</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About RailwayBot

RailwayBot is an open source companion bot for railway users, made for fulfilling the needs of knowing if you've got a memory leak, or one of your services has crashed, all from the comfort of discord.

## Getting Started

### Prerequisites

Since this bot is made in typescript, it uses discord.js, and other packages, so make sure you have both node and npm installed.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/LaCrak27/RailwayBot.git
   ```
2. Install NPM packages
   ```sh
   npm i
   ```
3. Create an application on discord's developer portal and get it's bot token. [(help)](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
4. Get a railway api token linked to your account. [(help)](https://docs.railway.app/reference/public-api#authentication)

5. Prepare your enviroment file (`.env`)
   ```env
    DISCORDTOKEN=(discord bot token)
    LOGCHANNEL=(channel id for deployment and crash logs)
    USAGECHANNEL=(channel id for usage reports)
    RAILWAYAPIKEY=(railway api key)
    TEAMID=(Team ID (only populate if you are gonna use a team token))
   ```

<p align="right">(<a href="#about-railwaybot">back to top</a>)</p>

## Usage

If you only intend on using the bot, then you can just clone the repository, host it on your hosting platform of choice filling all the enviroment variables (we all know what that platform is don't we), and invite the resulting bot to your server.

After this is done, you need to add a webhook to railway for every project you intend on logging its crashes/deployments. Said webhook must point to "<YourBot's URL>/railway".

<p align="right">(<a href="#about-railwaybot">back to top</a>)</p>

## Features

- Deploy logs showing all kinds of information about the deploy.
- Crash alerts for any of your services.
- Hourly usage reports, showing a detailed breakdown.

See the [open issues](https://github.com/LaCrak27/RailwayBot/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#about-railwaybot">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#about-railwaybot">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#about-railwaybot">back to top</a>)</p>

## Sponsors

- <img src="https://ponderly.s3.us-east-2.amazonaws.com/production/ponderly-logo.jpg" alt="drawing" width="32"/> $160 USD. You can learn more about them <a href="https://www.ponder.ly/" target="_blank">here!</a>
