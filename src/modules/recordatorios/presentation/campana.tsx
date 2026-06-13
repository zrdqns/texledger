import { listarNotificacionesNoLeidas } from "../application/notificaciones-actions";
import { CampanaMenu } from "./campana-menu";

export async function Campana() {
  const notificaciones = await listarNotificacionesNoLeidas();
  return <CampanaMenu notificaciones={notificaciones} />;
}
