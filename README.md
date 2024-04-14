1. npx create-expo-app -t expo-template-blank-typescript expo-ble-sample
2. npx expo install react-native-ble-plx @config-plugins/react-native-ble-plx -- --legacy-peer-deps
3. npx expo install expo-device react-native-base64 -- --legacy-peer-deps
4. npx expo install @shopify/react-native-skia -- --legacy-peer-deps
5. npx npm install eas-cli --legacy-peer-deps
6. npm i expo-system-ui --legacy-peer-deps
7. npm i expo-dev-client --legacy-peer-deps

==> 
1. export ANDROID_HOME=/home/thanhpc/Android/Sdk
2. yarn android
Additional step if error: create `local.properties` and put the content: `sdk.dir = /home/thanhpc/Android/Sdk`
then run: `cd android && ./gradlew clean`