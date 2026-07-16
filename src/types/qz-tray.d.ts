declare module "qz-tray" {
  type PrinterConfig = unknown;

  const qz: {
    websocket: {
      isActive(): boolean;
      connect(): Promise<void>;
    };
    printers: {
      find(name: string): Promise<string>;
    };
    configs: {
      create(printer: string, options?: Record<string, unknown>): PrinterConfig;
    };
    security: {
      setCertificatePromise(handler: () => Promise<string> | string): void;
      setSignatureAlgorithm(algorithm: "SHA1" | "SHA256" | "SHA512"): void;
      setSignaturePromise(handler: (dataToSign: string) => Promise<string> | string): void;
    };
    print(config: PrinterConfig, data: string[]): Promise<void>;
  };

  export default qz;
}
