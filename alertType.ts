enum AlertType {
  gte = "gte",
  lte = "lte",
  neq = "neq",
}
export default AlertType;

export function alertTypeToText(type: AlertType) {
  switch (type) {
    case AlertType.gte:
      return ">=";
    case AlertType.lte:
      return "<=";
    case AlertType.neq:
      return "not";
  }
}
