import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createCipheriv, randomBytes, createDecipheriv } from "crypto";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function unslugify(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\band\b/g, '&') // only if you always replaced & with 'and'
    .replace(/\b\w/g, c => c.toUpperCase()); // capitalize each word
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '')     // trim hyphens from start/end
}


export function getRandomAvataaarsUrl() {
  const base = "https://avataaars.io/";

  const options = {
    avatarStyle: ["Circle", "Transparent"],
    topType: [
      "NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1", "WinterHat2", "WinterHat3", "WinterHat4",
      "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", "LongHairDreads",
      "LongHairFrida", "LongHairFro", "LongHairFroBand", "LongHairNotTooLong", "LongHairShavedSides",
      "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand",
      "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", "ShortHairShaggyMullet", "ShortHairShortCurly",
      "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShortWaved", "ShortHairSides", "ShortHairTheCaesar",
      "ShortHairTheCaesarSidePart"
    ],
    accessoriesType: [
      "Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"
    ],
    hairColor: [
      "Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Platinum", "Red", "SilverGray"
    ],
    facialHairType: [
      "Blank", "BeardMedium", "BeardLight", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"
    ],
    facialHairColor: [
      "Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "Platinum", "Red"
    ],
    clotheType: [
      "BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck",
      "ShirtScoopNeck", "ShirtVNeck"
    ],
    clotheColor: [
      "Black", "Blue01", "Blue02", "Blue03", "Gray01", "Gray02", "Heather", "PastelBlue", "PastelGreen",
      "PastelOrange", "PastelRed", "PastelYellow", "Pink", "Red", "White"
    ],
    eyeType: [
      "Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink", "WinkWacky"
    ],
    eyebrowType: [
      "Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", "RaisedExcitedNatural",
      "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown", "UpDownNatural"
    ],
    mouthType: [
      "Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"
    ],
    skinColor: [
      "Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"
    ]
  };

  function pick(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const params = [
    `avatarStyle=${pick(options.avatarStyle)}`,
    `topType=${pick(options.topType)}`,
    `accessoriesType=${pick(options.accessoriesType)}`,
    `hairColor=${pick(options.hairColor)}`,
    `facialHairType=${pick(options.facialHairType)}`,
    `facialHairColor=${pick(options.facialHairColor)}`,
    `clotheType=${pick(options.clotheType)}`,
    `clotheColor=${pick(options.clotheColor)}`,
    `eyeType=${pick(options.eyeType)}`,
    `eyebrowType=${pick(options.eyebrowType)}`,
    `mouthType=${pick(options.mouthType)}`,
    `skinColor=${pick(options.skinColor)}`
  ];

  return `${base}?${params.join("&")}`;
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}


const algorithm = "aes-256-cbc";
const secret = Buffer.from(process.env.NEXT_PUBLIC_SECRETE_HASH_KEY!, "hex"); // 32 bytes
const iv = randomBytes(16); // 16 bytes

export function encryptCardNumber(cardNumber: string): string {
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(cardNumber, "utf8"),
    cipher.final(),
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex"); // Store both
}


export function decryptCardNumber(encryptedData: string): string {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(secret), iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export const deleteImage = async (fileUrl: string) => {
  try {

    const pathParts = fileUrl.split("/")
    const bucket = pathParts.at(7)!
    const fileName = pathParts.at(-1) // The rest is the file path
    const folder = pathParts.at(-2)

    
    if (!fileUrl) {
      throw new Error("Invalid Supabase storage URL");
    }

    const fileForDelete = bucket === "store-assets"? fileName : `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([fileForDelete!]);

    if (error) {
      console.error("Error deleting image:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Failed to delete image") 
    };
  }
};
