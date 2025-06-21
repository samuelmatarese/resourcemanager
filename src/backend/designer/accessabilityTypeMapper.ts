import { AccessabilityType } from "./accessabilityType";

export class AccessabilityTypeMapper {
  public static MapToText(type: AccessabilityType): string {
    switch (type) {
      case AccessabilityType.Private:
        return "private";
      case AccessabilityType.Protected:
        return "protected";
      case AccessabilityType.Internal:
        return "internal";
      case AccessabilityType.Public:
        return "public";
    }
  }
}
