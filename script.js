let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

let editando = null;

renderizarClientes(clientes);

function abrirModal(){

  document.getElementById("modal").style.display = "flex";

}

function fecharModal(){

  document.getElementById("modal").style.display = "none";

}

function salvarCliente(){

  let nome = document.getElementById("nome").value;
  let telefone = document.getElementById("telefone").value;
  let empresa = document.getElementById("empresa").value;
  let status = document.getElementById("status").value;

  if(nome == "" || telefone == ""){
    alert("Preencha os campos");
    return;
  }

  let cliente = {
    nome,
    telefone,
    empresa,
    status
  };

  if(editando != null){

    clientes[editando] = cliente;

    editando = null;

  }else{

    clientes.push(cliente);

  }

  salvarDados();

  renderizarClientes(clientes);

  limparCampos();

  fecharModal();

}

function renderizarClientes(listaClientes){

  let lista = document.getElementById("lista-clientes");

  lista.innerHTML = "";

  document.getElementById("total-clientes").innerText =
    listaClientes.length;

  listaClientes.forEach((cliente, index) => {

    lista.innerHTML += `

      <div class="cliente">

        <div>

          <h3>${cliente.nome}</h3>

          <p>📞 ${cliente.telefone}</p>

          <p>🏢 ${cliente.empresa}</p>

          <p>📌 ${cliente.status}</p>

        </div>

        <div class="acoes">

          <button
            class="editar"
            onclick="editarCliente(${index})"
          >
            Editar
          </button>

          <button
            class="excluir"
            onclick="removerCliente(${index})"
          >
            Excluir
          </button>

        </div>

      </div>

    `;

  });

}

function removerCliente(index){

  clientes.splice(index, 1);

  salvarDados();

  renderizarClientes(clientes);

}

function editarCliente(index){

  let cliente = clientes[index];

  document.getElementById("nome").value = cliente.nome;
  document.getElementById("telefone").value = cliente.telefone;
  document.getElementById("empresa").value = cliente.empresa;
  document.getElementById("status").value = cliente.status;

  editando = index;

  abrirModal();

}

function buscarClientes(){

  let busca =
    document.getElementById("busca").value.toLowerCase();

  let filtrados = clientes.filter(cliente =>

    cliente.nome.toLowerCase().includes(busca)

  );

  renderizarClientes(filtrados);

}

function salvarDados(){

  localStorage.setItem(
    "clientes",
    JSON.stringify(clientes)
  );

}

function limparCampos(){

  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("empresa").value = "";

}