verificarLogin();

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

let clientes = [];

let editando = null;

buscarClientes();

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

    alert("Preencha os campos");

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

  if (editando != null) {

    const id = clientes[editando].id;

    await client
      .from("clientes")
      .update(cliente)
      .eq("id", id);

    editando = null;

  } else {

    await client
      .from("clientes")
      .insert([cliente]);

  }

  buscarClientes();

  limparCampos();

  fecharModal();

}

async function buscarClientes() {

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

function renderizarClientes(listaClientes) {

  let lista = document.getElementById("lista-clientes");

  lista.innerHTML = "";

  document.getElementById("total-clientes").innerText =
    listaClientes.length;

  let quentes = listaClientes.filter(cliente =>

    cliente.status == "Quente"

  ).length;

  let fechados = listaClientes.filter(cliente =>

    cliente.status == "Fechado"

  ).length;

  document.getElementById("leads-quentes")
    .innerText = quentes;

  document.getElementById("clientes-fechados")
    .innerText = fechados;



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

async function removerCliente(index) {

  const id = clientes[index].id;

  await client
    .from("clientes")
    .delete()
    .eq("id", id);

  buscarClientes();

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