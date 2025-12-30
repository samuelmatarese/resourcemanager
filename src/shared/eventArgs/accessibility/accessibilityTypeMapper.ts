import { AccessibilityType as AccessibilityType } from "./accessibilityType";

export class AccessibilityTypeMapper {
  public static MapToText(type: AccessibilityType): string {
    switch (type) {
      case AccessibilityType.Internal:
        return "internal";
      case AccessibilityType.Public:
        return "public";
      case AccessibilityType.None:
        return "none";
    }
  }

  public static MapToType(text: string): AccessibilityType {
    switch (text) {
      case "internal":
      case "0":
        return AccessibilityType.Internal;
      case "public":
      case "1":
        return AccessibilityType.Public;
      case "none":
      case "2":
        return AccessibilityType.None;
      default:
        throw new Error(`No type for ${text} defined`);
    }
  }

  public static GetAll(): AccessibilityType[] {
    return [AccessibilityType.Internal, AccessibilityType.Public, AccessibilityType.None];
  }
}
