import {html, render} from 'https://unpkg.com/lit-html?module';

const clientId = '777999046647-l1423mpflvhsnovrsot8uu9921p10prc.apps.googleusercontent.com'

const bodyTemplate = ({loggedIn, cred, disableAutoSignIn}) => {
  const picture = loggedIn && cred.profilePicture && html`
      <li><img src="${cred.profilePicture}"></li>
  `
  const profile = loggedIn && cred && html`
    <ul>
      <li>${cred.displayName}</li>
      <li>${cred.id}</li>
      ${picture}
      <li><button @click=${logout}>Logout</button></li>
    </ul>
  `

  return html`
    <h1>gyolotest</h1>

    <p>Logged In? ${loggedIn ? 'yes' : 'no'}</p>

    ${profile}
  `

  function logout (e) {
    console.log('logout')
    disableAutoSignIn()
    .then(() => {
      // Auto sign-in disabled.
      state.loggedIn = false
      r()
    })
    .catch(err => {
      console.error('Error', err)
    })
  }
}

// Render the template to the document

let state = {
  loggedIn: false
}

function r () {
  render(bodyTemplate(state), document.body)
}

r()

window.onGoogleYoloLoad = (googleyolo) => {
  // The 'googleyolo' object is ready for use.
  console.log('Jim ready', googleyolo)
  state.disableAutoSignIn = googleyolo.disableAutoSignIn.bind(googleyolo)

  const retrievePromise = googleyolo.retrieve({
    supportedAuthMethods: [
      "https://accounts.google.com"
    ],
    supportedIdTokenProviders: [
      {
        uri: "https://accounts.google.com",
        clientId
      }
    ]
  })

  retrievePromise.then((credential) => {
    console.log('Jim1 resolved', credential)
    state.loggedIn = true
    state.cred = credential
    r()
    if (credential.password) {
      // An ID (usually email address) and password credential was retrieved.
      // Sign in to your backend using the password.
      // signInWithEmailAndPassword(credential.id, credential.password);
    } else {
      // A Google Account is retrieved. Since Google supports ID token responses,
      // you can use the token to sign in instead of initiating the Google sign-in
      // flow.
      // useGoogleIdTokenForAuth(credential.idToken);
    }
  }, (error) => {
    // Credentials could not be retrieved. In general, if the user does not
    // need to be signed in to use the page, you can just fail silently; or,
    // you can also examine the error object to handle specific error cases.

    // If retrieval failed because there were no credentials available, and
    // signing in might be useful or is required to proceed from this page,
    // you can call `hint()` to prompt the user to select an account to sign
    // in or sign up with.
    console.log('Jim2 rejected', error)
    if (error.type === 'noCredentialsAvailable') {
      console.log('Jim3 googleyolo.hint')
      // googleyolo.hint(...).then(...);
      const hintPromise = googleyolo.hint({
        supportedAuthMethods: [
          "openyolo://id-and-password",
          "https://accounts.google.com"
        ],
        supportedIdTokenProviders: [
          {
            uri: "https://accounts.google.com",
            clientId
          }
        ]
      })
      hintPromise.then((credential) => {
        console.log('hint resolved', credential)
        state.loggedIn = true
        state.cred = credential
        r()
        if (credential.idToken) {
          // Send the token to your auth backend.
          console.log('Jim useGoogleIdTokenForAuth')
          // useGoogleIdTokenForAuth(credential.idToken);
        }
      }, (error) => {
        console.error('Jim error', error)
        switch (error.type) {
          case "userCanceled":
            // The user closed the hint selector. Depending on the desired UX,
            // request manual sign up or do nothing.
            break;
          case "noCredentialsAvailable":
            // No hint available for the session. Depending on the desired UX,
            // request manual sign up or do nothing.
            break;
          case "requestFailed":
            // The request failed, most likely because of a timeout.
            // You can retry another time if necessary.
            break;
          case "operationCanceled":
            // The operation was programmatically canceled, do nothing.
            break;
          case "illegalConcurrentRequest":
            // Another operation is pending, this one was aborted.
            break;
          case "initializationError":
            // Failed to initialize. Refer to error.message for debugging.
            break;
          case "configurationError":
            // Configuration error. Refer to error.message for debugging.
            break;
          default:
            // Unknown error, do nothing.
        }
      });
    }
  })
}

if (window.openyolo) {
  window.openyolo.setProviderUrlBase('http://localhost:4201/openyolo-provider')
  window.onGoogleYoloLoad(window.openyolo)
}

