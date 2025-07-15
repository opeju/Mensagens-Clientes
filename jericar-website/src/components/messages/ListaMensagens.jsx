import { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";
import MensagemCard from "./MensagemCard";

function ListaMensagens() {
  const [mensagens, setMensagens] = useState([]);

  useEffect(() => {
    ApiService.listarMensagens()
      .then(setMensagens)
      .catch(console.error);
  }, []);

  return (
    <div className="grid gap-4">
      {mensagens.length > 0 ? (
        mensagens.map((msg) => (
          <MensagemCard key={msg.id} mensagem={msg} />
        ))
      ) : (
        <p>Nenhuma mensagem encontrada.</p>
      )}
    </div>
  );
}

export default ListaMensagens;
