# Smartmirror.one - Google Calendar Connector

## What does it do
It's a simple wrapper around Google's [Maps API Example for NodeJS](https://developers.google.com/calendar/quickstart/), to make it easy to import for the [SmartMirror1](https://smarmirror.one) project.

## How can I use it
1. Perform Step 1 [here](https://developers.google.com/calendar/quickstart/nodejs#step_1_turn_on_the) and download the credentials file.
   - We've noticed that even though you provide your own custom "app"-name, it might still report 'Quickstart' later. Don't worry about it.
   - Be sure to include `'http://localhost'` in the allowed return URLs.
   - If you have something running at localhost port 80, suffix with an unused port.
1. Create a `.env` file in the project root.
   - Add the values of the `client_id`, `client_secret` and `return_url` keys to the file as follows:
    ```sh
    CLIENT_ID=yourPersonalIdFromCredentialsFile.apps.googleusercontent.com
    RETURN_URL=http://localhost
    CLIENT_SECRET=SecretFromCredentialsFile
    ``` 
   - If you opt for different env-variable names, make sure to update them in the example as well.
1. Check out `example.js` on how you can now use the different methods of the `gCalendarConnector` class.
1. Create your own project and continue from there.

## Can I use this implementation to do something different...
Sure. This wrapper is delivered on the [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
Just make sure that you uphold the terms & conditions of Google that you accept when creating your "app" in step 1.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a>