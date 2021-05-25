const emojiRegex = require('emoji-regex');

const emojiRegexPattern = emojiRegex();

/**
 * The result "1f622"
 * @param {string} emoji
 */
const convertEmojiToUnicode = (emoji) => {
  return emoji.replace(
    emojiRegexPattern,
    (m) => `${m.codePointAt(0).toString(16)}`
  );
};

/**
 * The result "😢"
 * @param {string} unicode It like this "1f622"
 */
const convertUnicodeToEmoji = (unicode) => {
  if (unicode.match(emojiRegexPattern)) {
    return unicode;
  }

  return String.fromCodePoint(parseInt(convertEmojiToUnicode(unicode), 16));
};

module.exports = {
  convertEmojiToUnicode,
  convertUnicodeToEmoji,
};
