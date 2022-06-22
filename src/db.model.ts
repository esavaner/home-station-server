export type Sensor = {
  pin: number;
  description: string;
};

export type SensorRead = Sensor & {
  isOn: boolean;
};

export type OneWire = {
  id: string;
  description: string;
};

export type OneWireRead = OneWire & {
  temp: number | null;
};

export type StatusModel = {
  time: number;
  sensors: SensorRead[];
  onewires: OneWireRead[];
};

export type OneCallModel = any;
