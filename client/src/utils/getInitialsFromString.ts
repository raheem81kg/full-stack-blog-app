function getInitialsFromString(name: string): string {
    const words: string[] = name.split(" "); // Split the string into words
    const initials: string[] = words.map((word: string) => word.charAt(0)); // Get the first character of each word

    return initials.join(""); // Join the first characters to form initials
}

export default getInitialsFromString;
