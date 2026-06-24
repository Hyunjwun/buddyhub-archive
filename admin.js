const SUPABASE_URL =
"https://yqewwyvrtwaiqihdafip.supabase.co"

const SUPABASE_KEY =
"sb_publishable_xLj3opvgN5pjyPs1GEVKRQ_shS-tvHQ"

const client =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)

const adminGallery =
document.getElementById("adminGallery")

async function loadAdmin(){

  const { data,error } =
  await client
  .from("wishes")
  .select("*")
  .order("created_at",{ascending:false})

  if(error){
    console.log(error)
    return
  }

  adminGallery.innerHTML = ""

  data.forEach(item=>{

    const safeName =
    item.name
    .toLowerCase()
    .replace(/\s+/g,"-")

    adminGallery.innerHTML += `

    <div class="card">

      <div class="filename">
        ${safeName}.jpg
      </div>

      <img src="${item.photo_url}">

      <div class="wish">
        ${item.wish}
      </div>

      <button
        class="deleteBtn"
        onclick="deleteWish(${item.id})"
      >
        🗑 Delete
      </button>

    </div>

    `
  })
}

async function deleteWish(id){

  const ok =
  confirm("Delete this wish?")

  if(!ok) return

  const { error } =
  await client
  .from("wishes")
  .delete()
  .eq("id",id)

  if(error){

    alert(error.message)
    return

  }

  loadAdmin()
}

loadAdmin()