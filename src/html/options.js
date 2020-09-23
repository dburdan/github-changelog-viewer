const updateStatusMessage = (message, type, onComplete) => {
  var statusText = document.getElementById('status--text');
  var validationWarning = document.getElementById('validation-warning');

  if (type === 'success') {
    statusText.textContent = message;
    document.getElementById('status').style.display = 'inline-block';
  } else {
    validationWarning.textContent = message;
  }

  setTimeout(() => {
    if (onComplete) onComplete();
    statusText.textContent = '';
    document.getElementById('status').style.display = 'none';
  }, 2000);
};

const validateUserToken = (token) => {
  var invalidTokenMsg;
  if (typeof token !== 'string') {
    invalidTokenMsg = 'Access Token should be a hex string.';
  } else if (token.length < 30) {
    invalidTokenMsg = 'Access Token length is incorrect.';
  }

  if (invalidTokenMsg) {
    document.getElementById('validation-block').style.display = 'inline-block';
  } else {
    document.getElementById('validation-block').style.display = 'none';
  }

  return invalidTokenMsg;
}

// Manually clear repo cache from local storage
const clearCache = () => {
  const button = document.getElementById('clear-cache-btn');
  button.setAttribute('disabled', 'disabled');
  button.textContent = 'Clearing...';
  chrome.storage.local.clear(() => {
    button.textContent = 'Clear Cache';
    button.removeAttribute('disabled');
    updateStatusMessage('Cache cleared!', 'success');
  });
};

// Saves options to chrome.storage
const saveOptions = () => {
  document.getElementById('save-btn').setAttribute('disabled', 'disabled');
  var token = document.getElementById('gcviewer-token').value;
  chrome.storage.sync.set(
    {
      ['gcviewer-token']: token
    },
    () => {
      var validationMessage = validateUserToken(token);
      var statsUpdateComplete = () => {
        document.getElementById('save-btn').removeAttribute('disabled');
      };
      if (!!validationMessage) {
        updateStatusMessage(validationMessage, 'warning', statsUpdateComplete);
      } else {
        updateStatusMessage('Options saved!', 'success', statsUpdateComplete);
      }
    }
  );
}

// Restore options from chrome.storage
const restoreOptions = () => {
  var token;
  chrome.storage.sync.get(
    {
      ['gcviewer-token']: '',
    },
    (storedData) => {
      token = storedData['gcviewer-token'];
      document.getElementById('gcviewer-token').value = token;
      var validationWarning = document.getElementById('validation-warning');
      validationWarning.textContent = validateUserToken(token);
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('clear-cache-btn').addEventListener('click', clearCache);
document.getElementById('save-btn').addEventListener('click', saveOptions);