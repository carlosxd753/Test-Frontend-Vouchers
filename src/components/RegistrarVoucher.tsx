// import { Stomp } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

interface Voucher {
  id: string;
  numeroOperacion: string;
  entidad: string;
  clienteDniRuc: string;
  fechaHora: string;
}

const RegistrarVoucher = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const hoy = new Date();
  // Fecha en formato yyyy-MM-dd
  const fechaInicial = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${hoy.getDate().toString().padStart(2, "0")}`;

  // Hora en formato HH:mm
  const horaInicial = `${hoy.getHours().toString().padStart(2, "0")}:${hoy
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const [form, setForm] = useState({
    numeroOperacion: "",
    entidad: "BCP",
    clienteDniRuc: "",
    fecha: fechaInicial, // yyyy-MM-dd
    hora: horaInicial, // HH:mm
  });
  const [vouchers, setVouchers] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    fetch(`${apiUrl}/api/vouchers`)
      .then((res) => res.json())
      .then((data) => {
        setVouchers(ordenarVouchers(data));
      });
  }, []);

  // Conectar WebSocket
  // useEffect(() => {
  //   const socket = new SockJS("http://localhost:8080/ws");
  //   const client = Stomp.over(socket);

  //   client.connect({}, () => {
  //     client.subscribe("/topic/vouchers", (message) => {
  //       const nuevoVoucher = JSON.parse(message.body);
  //       setVouchers((prev) => ordenarVouchers([...prev, nuevoVoucher]));
  //     });
  //   });

  //   return () => client.disconnect();
  // }, []);

  const ordenarVouchers = (list: Voucher[]): Voucher[] => {
    return list.sort(
      (a, b) =>
        new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Permitir solo números
    const numericValue = value.replace(/[^0-9]/g, "");

    setForm({ ...form, [name]: numericValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    console.log("Fecha: ", form.fecha);
    console.log("Hora: ", form.hora);
    const fechaHoraISO = `${form.fecha}T${form.hora}:00`; // Combina fecha y hora exacta
    try {
      const res = await fetch(`${apiUrl}/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroOperacion: form.numeroOperacion,
          entidad: form.entidad,
          clienteDniRuc: form.clienteDniRuc,
          fechaHora: fechaHoraISO,
        }),
      });

      const data = await res.json(); // capturamos el JSON de la respuesta

      if (res.ok) {
        // Éxito
        Swal.fire({
          icon: "success",
          title: "Voucher guardado",
          text: data.message || "Se guardó correctamente",
        });

        setForm({
          numeroOperacion: "",
          entidad: "BCP",
          clienteDniRuc: "",
          fecha: fechaInicial,
          hora: horaInicial,
        });
      } else {
        // Error del backend
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Ocurrió un error al guardar el voucher",
        });
      }
    } catch (error) {
      // Error de red o inesperado
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false); // re-habilitamos el formulario
    }
  };

  // Agrupar vouchers por fecha (solo día, no hora)
  const groupByDate = (list: Voucher[]) => {
    return list.reduce((acc, voucher) => {
      const fecha = new Date(voucher.fechaHora).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(voucher);
      return acc;
    }, {});
  };

  const groupedVouchers = groupByDate(vouchers);

  return (
    <section>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold m-4 text-center">
          Registro de Vouchers
        </h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg  mb-6">
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                name="numeroOperacion"
                value={form.numeroOperacion}
                onChange={handleChangeInputs}
                placeholder="Número de Operación"
                className="form-control"
                required
                autoFocus
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="clienteDniRuc"
                value={form.clienteDniRuc}
                onChange={handleChangeInputs}
                placeholder="DNI o RUC"
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <select
                name="entidad"
                value={form.entidad}
                onChange={handleChange}
                className="form-select"
                required
                style={{ width: "200px" }}
              >
                <option value="BCP">BCP</option>
                <option value="Yape">Yape</option>
                <option value="BBVA">BBVA</option>
                <option value="Plin">Plin</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="Banco de la nacion">Banco de la Nación</option>
              </select>
            </div>
            <div className="col ">
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="form-control"
                style={{ width: "140px" }}
              />
            </div>
            <div className="col">
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="form-control"
                style={{ width: "140px" }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <button type="submit" className="btn btn-primary w-100">
                {isSubmitting ? "Registrando Voucher..." : "Registrar Voucher"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegistrarVoucher;
