<p align="center"><a href="https://ecole-directe.plus" target="_blank"><img src="https://i.ibb.co/XX4XwWM/Group-76.png" width="800" alt="Ecole Directe Plus logo"></a></p>
<p align="center">
<img src="https://github.com/Magic-Fishes/Ecole-Directe-Plus/actions/workflows/dev-build-deploy.yml/badge.svg" alt="Build Status (dev-channel)">
<img alt="License MIT" src="https://img.shields.io/badge/license-MIT-green">
<img src="https://github.com/Magic-Fishes/Ecole-Directe-Plus/actions/workflows/main-build-deploy.yml/badge.svg" alt="Build Status (dev-channel)">
</p>

> [!NOTE]
> This fork contains an experimental **ED+ Student Suite** branch with a live timetable, grade median and simulations, mock-brevet tracking, custom themes, local QCM practice, streaks and unlockable mini-games. Extra user-created data is stored locally in the browser.

## About Ecole Directe Plus

Ecole Directe Plus is basically a better EcoleDirecte.
The EcoleDirecte platform has been completely redesigned from scratch to offer the best comfort to all students.
Enjoy the most-requested features and a ton of small but game changer improvements.

> [!warning]
> This project is not affiliated with EcoleDirecte or Aplim in any way.

### New features

- Dashboard
- Grades average
- Instant averages calculation
- Last grades overview
- Dark/light mode
- Your strengths
- Upcoming assignments
- And so much more...

## Getting started

- Visit the [Ecole Directe Plus](https://ecole-directe.plus/login) website
- Use your EcoleDirecte credentials to login
- That's it, enjoy!

## FAQ

- An error of any kind?<br>Please install EDP Unblock from the [Mozilla Add-On Store](https://addons.mozilla.org/en-US/firefox/addon/ecole-directe-plus-unblock/) or the [Chrome Web Store](https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb) before reporting a bug or asking for help in the [discord](https://discord.gg/AKAqXfTgvE).
- A release date?<br>When it's ready.
- My data?<br>We don't and will never collect any data about you, more details in our privacy policy.
- Do I need an application?<br>No, you don't. Ecole Directe Plus is a web application therefore you just need a browser, however you can easily install it as an application (check out our tutorial).

## Join us

Are you excited about this project ?<br>
Please provide us feedbacks through the issues page :<br>
[https://github.com/Magic-Fishes/Ecole-Directe-Plus/issues](https://github.com/Magic-Fishes/Ecole-Directe-Plus/issues)<br>
Don't hesitate to take part into this project through the pull request page :<br>
[https://github.com/Magic-Fishes/Ecole-Directe-Plus/pulls](https://github.com/Magic-Fishes/Ecole-Directe-Plus/pulls)<br>
We'd be glad to collaborate with you 🤝<br>

Meet the Ecole Directe Plus community by joining the [Discord server](https://discord.gg/AKAqXfTgvE).

## Contributing

Ecole Directe Plus is built on React. We use VITE development environment to work. Here is how to setup:

```bash
# install dependencies
npm install
```

#### If you want to try and use the website and all its feature, we recommend doing the following. If you just want to test the website without login check the instruction below the following.

First add the line
```
127.0.0.1 local.ecole-directe.plus
```
to ``/etc/hosts`` (Linux/MacOS) or ``%SystemRoot%/System32/drivers/etc/hosts`` (Windows) and the run the command:

```bash
# run on local.ecole-directe.plus:3000
npm run domain
```

#### If you don't care about login on EDP and making request to EcoleDirecte (why ?) you can still do this:

```bash
# run on localhost
npm run dev

# host the website
npm run host

# run preview of the build
npm run preview
```

## Code of Conduct

In order to ensure that the Ecole Directe Plus community is welcoming to all, please review and abide by the [Code of Conduct](https://github.com/Magic-Fishes/Ecole-Directe-Plus/blob/main/CODE_OF_CONDUCT.md).

## Security Vulnerabilities

If you find a vulnerability, please contact <contact@ecole-directe.plus> or send a feedback through the feedback page of EDP, do not disclose the vulnerability on the public issue tracker.

## License

The Ecole Directe Plus webapp is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
