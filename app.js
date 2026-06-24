const SUPABASE_URL =
"https://yqewwyvrtwaiqihdafip.supabase.co"

const SUPABASE_KEY =
"sb_publishable_xLj3opvgN5pjyPs1GEVKRQ_shS-tvHQ"

const client =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)

const gallery =
document.getElementById("gallery")

const modal =
document.getElementById("modal")

const counter =
document.getElementById("counter")

const preview =
document.getElementById("preview")

const photoInput =
document.getElementById("photo")

const empty =
document.getElementById("empty")

let page = 0
let loading = false

/* -------------------- */
/* OPEN MODAL */
/* -------------------- */

document
.getElementById("openModal")
.addEventListener("click", () => {

  modal.style.display = "flex"

})

modal.addEventListener("click", (e) => {

  if(e.target === modal){

    modal.style.display = "none"

  }

})

/* -------------------- */
/* PREVIEW IMAGE */
/* -------------------- */

photoInput.addEventListener("change", () => {

  const file = photoInput.files[0]

  if(!file) return

  preview.src =
  URL.createObjectURL(file)

  preview.style.display = "block"

})

/* -------------------- */
/* LOAD WISHES */
/* -------------------- */

async function loadWishes(){

  if(loading) return

  loading = true

  const start = page * 100
  const end = start + 99

  const { data, error } =
  await client
  .from("wishes")
  .select("*")
  .order("created_at", {
    ascending:false
  })
  .range(start,end)

  if(error){

    console.log(error)

    loading = false

    return

  }

  if(page === 0){

    gallery.innerHTML = ""

  }

  if(data.length === 0 && page === 0){

    empty.style.display = "block"

  }

  data.forEach((item,index)=>{

    const offsets = [
      "",
      "offset1",
      "offset2",
      "offset3",
      "offset4"
    ]

    const filename =
    item.name
    .toLowerCase()
    .replace(/\s+/g,"-")

    gallery.innerHTML += `

    <div class="card ${offsets[index % 5]}">

      <div class="filename">
        ${filename}.jpg
      </div>

      <img
        src="${item.photo_url}"
        alt="${item.name}"
      >

      <div class="wish">
        ${item.wish}
      </div>

    </div>

    `

  })

  page++

  loading = false

}

/* -------------------- */
/* COUNTER */
/* -------------------- */

async function loadCounter(){

  const { count } =
  await client
  .from("wishes")
  .select("*", {
    count:"exact",
    head:true
  })

  counter.textContent =
  `${count || 0} Wishes Collected 💙`

}

loadCounter()
loadWishes()

/* -------------------- */
/* INFINITE SCROLL */
/* -------------------- */

window.addEventListener("scroll",()=>{

  if(

    window.innerHeight +
    window.scrollY >=
    document.body.offsetHeight - 1000

  ){

    loadWishes()

  }

})

/* -------------------- */
/* SUBMIT */
/* -------------------- */

document
.getElementById("submitBtn")
.addEventListener("click", async()=>{

  const name =
  document
  .getElementById("name")
  .value
  .trim()

  const wish =
  document
  .getElementById("wish")
  .value
  .trim()

  const file =
  photoInput.files[0]

  if(!name){

    alert("Enter your name.")
    return

  }

  if(!wish){

    alert("Write a wish.")
    return

  }

  if(!file){

    alert("Upload a photo.")
    return

  }

  if(name.length > 20){

    alert("Maximum 20 characters.")
    return

  }

  if(wish.length > 150){

    alert("Maximum 150 characters.")
    return

  }

  if(file.size > 5 * 1024 * 1024){

    alert("Maximum 5MB.")
    return

  }

  const filename =
  `${Date.now()}-${file.name}`

  const upload =
  await client
  .storage
  .from("photos")
  .upload(
    filename,
    file
  )

  if(upload.error){

    alert(upload.error.message)

    return

  }

  const {
    data:publicData
  } =
  client
  .storage
  .from("photos")
  .getPublicUrl(filename)

  const insert =
  await client
  .from("wishes")
  .insert({

    name,

    wish,

    photo_url:
    publicData.publicUrl

  })

  if(insert.error){

    alert(insert.error.message)

    return

  }

  document
  .getElementById("name")
  .value = ""

  document
  .getElementById("wish")
  .value = ""

  photoInput.value = ""

  preview.src = ""

  preview.style.display = "none"

  modal.style.display = "none"

  page = 0

  gallery.innerHTML = ""

  loadCounter()
  loadWishes()

})