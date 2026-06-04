interface UserPreferences {
    theme: "light" | "dark";
    language: string;
}

await store.setJSON("preferences", { theme: "dark", language: "en" } satisfies UserPreferences);

const preferences = await store.getJSON<UserPreferences>("preferences");

if (preferences === null) {
    console.log("No preferences found");
} else {
    console.log("Theme:", preferences.theme);
    console.log("Language:", preferences.language);
}
