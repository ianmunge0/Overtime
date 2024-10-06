# Overtime
### Requirement
Install Valora from [here](https://play.google.com/store/apps/details?id=co.clabs.valora) and set up a wallet

### Running the app
Run these from terminal/cli

```git clone https://github.com/Overtime-Org/Overtime.git```

```cd Overtime/```

```git checkout reown```

```npm install```

Rename ```.env.example``` file to ```.env```

Register Overtime as a project in your WalletConnect Cloud account [here](https://cloud.walletconnect.com/sign-in)

Put the project's ID, name and description from WalletConnect Cloud as the values of `PROJECT_ID`, `PROJECT_NAME` and `PROJECT_DESCRIPTION` respectively in the .env file.

Resume to terminal/cli and run `npx expo run:android`