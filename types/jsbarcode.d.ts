declare module 'jsbarcode' {
  export interface JsBarcodeOptions {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    textAlign?: 'left' | 'center' | 'right';
    textPosition?: 'top' | 'bottom';
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    valid?: (valid: boolean) => void;
  }

  function JsBarcode(
    element: string | HTMLCanvasElement | SVGSVGElement,
    data: string,
    options?: JsBarcodeOptions
  ): void;

  export default JsBarcode;
}
