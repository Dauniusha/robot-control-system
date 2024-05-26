export type RosVelocityMessage = {
  linear: { x: number; y: number; z: number };
  angular: { x: number; y: number; z: number };
};

export type OdometryMessage = {
  pose: {
    position: {
      x: number;
      y: number;
    };
    orientation: number;
  };
};

export type PositionDetails = {
  x: number;
  y: number;
  theta: number;
};

export type Coordinate = { x: number; y: number };
export type Path = Coordinate[];
