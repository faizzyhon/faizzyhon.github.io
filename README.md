# Muhammad Faizan — Engineering Portfolio

A responsive portfolio and local-first job-application tracker prototype, published at [faizzyhon.github.io](https://faizzyhon.github.io).

## Run locally

The site is static and has no build dependencies. From this directory, run:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## AutoJob prototype

The interactive demo lets visitors add roles, change status, search and filter applications, delete entries, and export a JSON backup. It stores data in the current browser's local storage; it does not send application data to a server. Use **Reset sample data** to restore the original demonstration entries.

## Publish

The GitHub Actions workflow validates the required static assets, uploads this directory as a Pages artifact, and deploys it when changes reach `main`. GitHub Pages must have Actions selected as the repository's publishing source.

## Profile details

Professional details and the linked contribution status reflect the public `faizzyhon` GitHub profile and linked repositories. Contributions marked **In review** have not been presented as accepted work.
