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
    print(config: PrinterConfig, data: string[]): Promise<void>;
  };

  export default qz;
}
