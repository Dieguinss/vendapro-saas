async function verificarLogin() {

  const {
    data: { session }
  } = await client.auth.getSession();

  if (!session) {

    window.location.href = "login.html";

  }

}

const SUPABASE_URL = "https://tpxeyvjgsojeuncqawap.supabase.co";

const SUPABASE_KEY = "sb_publishable_mQcMW019j0O2TI3t3qyGEA_iT7ppgz4";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

verificarLogin();

let clientes = [];

let editando = null;

carregarClientes();

function abrirModal() {

  document.getElementById("modal").style.display = "flex";

}

function fecharModal() {

  document.getElementById("modal").style.display = "none";

}

async function salvarCliente() {

  let nome = document.getElementById("nome").value;

  let telefone = document.getElementById("telefone").value;

  let empresa = document.getElementById("empresa").value;

  let status = document.getElementById("status").value;

  if (nome == "" || telefone == "") {

    mostrarToast("Preencha os campos");

    return;

  }

  const {
    data: { user }
  } = await client.auth.getUser();

  let cliente = {

    nome,
    telefone,
    empresa,
    status,

    user_id: user.id

  };

  let error = null;

  if (editando != null) {

    const resposta = await client
      .from("clientes")
      .update(cliente)
      .eq("id", clientes[editando].id);

    error = resposta.error;

    editando = null;

  } else {

    const resposta = await client
      .from("clientes")
      .insert([cliente]);

    error = resposta.error;

  }

  if (error) {

    mostrarToast("Erro ao salvar");

    console.log(error);

    return;

  }

  mostrarToast("Cliente salvo com sucesso");

  carregarClientes();

  limparCampos();

  fecharModal();

}

async function carregarClientes() {

  const {
    data: { user }
  } = await client.auth.getUser();

  const { data, error } = await client
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {

    console.log(error);

    return;

  }

  clientes = data;

  renderizarClientes(clientes);

}

function buscarClientes() {

  const busca =
    document.getElementById("busca")
      .value
      .toLowerCase();

  const filtrados = clientes.filter(cliente =>

    cliente.nome.toLowerCase()
      .includes(busca)

  );

  renderizarClientes(filtrados);

}

function renderizarClientes(listaClientes) {

  document.getElementById("lead").innerHTML = "";

  document.getElementById("contato").innerHTML = "";

  document.getElementById("proposta").innerHTML = "";

  document.getElementById("fechado").innerHTML = "";

  document.getElementById("total-clientes").innerText =
    listaClientes.length;

  let leads = listaClientes.filter(cliente =>

    cliente.status == "Lead"

  ).length;

  let propostas = listaClientes.filter(cliente =>

    cliente.status == "Proposta"

  ).length;

  let fechados = listaClientes.filter(cliente =>

    cliente.status == "Fechado"

  ).length;

  let contatos = listaClientes.filter(cliente =>

    cliente.status == "Contato"

  ).length;

  atualizarGrafico(
    leads,
    contatos,
    propostas,
    fechados
  );

  document.getElementById("total-leads")
    .innerText = leads;

  document.getElementById("total-propostas")
    .innerText = propostas;

  document.getElementById("clientes-fechados")
    .innerText = fechados;

  listaClientes.forEach((cliente, index) => {

    let coluna = cliente.status.toLowerCase();

    if (
      coluna != "lead" &&
      coluna != "contato" &&
      coluna != "proposta" &&
      coluna != "fechado"
    ) {
      coluna = "lead";
    }

    document.getElementById(coluna).innerHTML += `

      <div
  class="card-cliente"
  draggable="true"
  ondragstart="arrastar(event)"
  data-id="${cliente.id}"
>

        <div>

          <h3>${cliente.nome}</h3>

          <p>📞 ${cliente.telefone}</p>

          <p>🏢 ${cliente.empresa}</p>

          <p>📌 ${cliente.status}</p>

        </div>

      <div class="acoes">

        <a
          href="https://wa.me/55${cliente.telefone.replace(/\D/g, '')}"
          target="_blank"
        >
          <button class="whats">
            WhatsApp
          </button>
        </a>

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

async function removerCliente(index) {

  const id = clientes[index].id;

  await client
    .from("clientes")
    .delete()
    .eq("id", id);

  carregarClientes();

}

function editarCliente(index) {

  let cliente = clientes[index];

  document.getElementById("nome").value =
    cliente.nome;

  document.getElementById("telefone").value =
    cliente.telefone;

  document.getElementById("empresa").value =
    cliente.empresa;

  document.getElementById("status").value =
    cliente.status;

  editando = index;

  abrirModal();

}

function limparCampos() {

  document.getElementById("nome").value = "";

  document.getElementById("telefone").value = "";

  document.getElementById("empresa").value = "";

}

async function logout() {

  await client.auth.signOut();

  window.location.href = "login.html";

}

function arrastar(event) {

  event.dataTransfer.setData(
    "id",
    event.target.dataset.id
  );

}

function permitirSoltar(event) {

  event.preventDefault();

}

async function soltar(event) {

  event.preventDefault();

  const id =
    event.dataTransfer.getData("id");

  const novoStatus =
    event.currentTarget.id;

  const { error } = await client
    .from("clientes")
    .update({
      status:
        novoStatus.charAt(0).toUpperCase() +
        novoStatus.slice(1)
    })
    .eq("id", id);

  if (error) {

    mostrarToast("Erro ao mover cliente");

    console.log(error);

    return;

  }

  mostrarToast("Cliente movido");

  carregarClientes();

}

let grafico = null;

function atualizarGrafico(
  leads,
  contatos,
  propostas,
  fechados
) {

  const ctx =
    document.getElementById("graficoFunil");

  if (grafico) {

    grafico.destroy();

  }

  grafico = new Chart(ctx, {

    type: "bar",

    data: {

      labels: [
        "Leads",
        "Contatos",
        "Propostas",
        "Fechados"
      ],

      datasets: [{

        label: "Clientes",

        data: [
          leads,
          contatos,
          propostas,
          fechados
        ]

      }]

    }

  });

}

function mostrarToast(mensagem) {

  const toast =
    document.getElementById("toast");

  toast.innerText = mensagem;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}