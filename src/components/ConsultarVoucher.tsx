import { useState } from "react";

interface Voucher {
  id: number;
  numeroOperacion: string;
  entidad: string;
  clienteDniRuc: string;
  fechaHora: string;
  createdAt: string;
}

const ConsultarVoucher = () => {
  const [form, setForm] = useState({ numeroOperacion: "", entidad: "BCP" });
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Permitir solo números
    const numericValue = value.replace(/[^0-9]/g, "");

    setForm({ ...form, [name]: numericValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/vouchers/buscar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok)
        throw new Error(
          "No se encontró el voucher con el numero de operación y entidad proporcionados"
        );

      const data: Voucher = await res.json();
      setVoucher(data);
    } catch (err: any) {
      setError(err.message || "Error al buscar voucher");
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-center m-5">Consultar Voucher</h1>
      <form onSubmit={handleSubmit} className="p-4 border rounded-lg  mb-6">
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              name="numeroOperacion"
              placeholder="Número de Operación"
              value={form.numeroOperacion}
              onChange={handleChangeInputs}
              required
              className="form-control"
            />
          </div>
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
        </div>
        <div className="row">
          <div className="col">
            <button type="submit" className="btn btn-primary w-100">
              {loading ? "Buscando Voucher..." : "Buscar Voucher"}
            </button>
          </div>
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {voucher && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Número de Operación:</strong> {voucher.numeroOperacion}
          </p>
          <p>
            <strong>Entidad:</strong> {voucher.entidad}
          </p>
          <p>
            <strong>DNI/RUC Cliente:</strong> {voucher.clienteDniRuc}
          </p>
          <p>
            <strong>Fecha/Hora:</strong>{" "}
            {new Date(voucher.fechaHora).toLocaleString("es-PE")}
          </p>
          <p>
            <strong>Se registró el:</strong>{" "}
            {new Date(voucher.createdAt).toLocaleString("es-PE")}
          </p>
        </div>
      )}
    </section>
  );
};
export default ConsultarVoucher;
