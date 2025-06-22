import { AccessabilityType } from "../../webview/events/accessability/accessabilityType";

export class AccessabilityTypeMapper {
  public static MapToText(type: AccessabilityType): string {
    switch (type) {
      case AccessabilityType.Internal:
        return "internal";
      case AccessabilityType.Public:
        return "public";
    }
  }

  public static MapToType(text: string): AccessabilityType {
    switch (text) {
      case "internal":
      case "0":
        return AccessabilityType.Internal;
      case "public":
      case "1":
        return AccessabilityType.Public;
      default:
        throw new Error(`No type for ${text} defined`);
    }
  }

  public static GetAll(): AccessabilityType[] {
    return [AccessabilityType.Internal, AccessabilityType.Public];
  }
}
