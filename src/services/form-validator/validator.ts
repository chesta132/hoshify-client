/**
 * Fast email validator without regex
 * Equivalent to: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
 * Performance: O(n) instead of catastrophic backtracking
 */
function isValidEmail(email: string) {
  if (!email || typeof email !== "string") return false;

  if (email.length < 5 || email.length > 320) return false;

  const atIndex = email.indexOf("@");
  if (atIndex === -1 || email.lastIndexOf("@") !== atIndex) return false;

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);

  if (!isValidLocalPart(localPart)) return false;

  if (!isValidDomainPart(domainPart)) return false;

  return true;
}

/**
 * Validates local part: \w+([.-]?\w+)*
 * Must start with word char, then optional [.-]word patterns
 */
function isValidLocalPart(local: string) {
  if (!local || local.length === 0) return false;

  if (!isWordChar(local[0])) return false;

  let i = 1;
  while (i < local.length) {
    const char = local[i];

    if (isWordChar(char)) {
      i++;
    } else if (char === "." || char === "-") {
      if (i + 1 >= local.length || !isWordChar(local[i + 1])) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Validates domain part: \w+([.-]?\w+)*(\.\w{2,3})+
 * Must have at least one dot with 2-3 char TLD
 */
function isValidDomainPart(domain: string) {
  if (!domain || domain.length === 0) return false;

  if (!domain.includes(".")) return false;

  const parts = domain.split(".");

  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1];
  if (tld.length < 2 || tld.length > 3 || !isAllWordChars(tld)) {
    return false;
  }

  for (const part of parts) {
    if (!isValidDomainSubpart(part)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates domain subpart: \w+([.-]?\w+)*
 * Similar to local part but for domain components
 */
function isValidDomainSubpart(part: string) {
  if (!part || part.length === 0) return false;

  if (!isWordChar(part[0])) return false;

  let i = 1;
  while (i < part.length) {
    const char = part[i];

    if (isWordChar(char)) {
      i++;
    } else if (char === "-") {
      if (i + 1 >= part.length || !isWordChar(part[i + 1])) {
        return false;
      }
      i += 2;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Check if character is word character (\w equivalent)
 * \w = [a-zA-Z0-9_]
 */
function isWordChar(char: string) {
  const code = char.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 // _
  );
}

/**
 * Check if all characters in string are word chars
 */
function isAllWordChars(str: string) {
  for (const char of str) {
    if (!isWordChar(char)) return false;
  }
  return true;
}

export { isAllWordChars, isValidDomainPart, isValidDomainSubpart, isValidEmail, isValidLocalPart, isWordChar };
