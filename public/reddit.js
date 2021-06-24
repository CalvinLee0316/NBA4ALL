

const container = document.querySelector(".reddit-container");


let posts = [];
let curr = 0;

window.onload = (event)=>{
  renderPosts();
}

const renderPosts = () =>{
    const proxy = "https://cors-anywhere.herokuapp.com/";

    fetch(`${proxy}https://www.reddit.com/r/nba/new.json`).then(function(res){
        return res.json();
    }).then(function(res){
        let currPost, markup = ``;
        posts = res.data.children;
        markup = `<h3> New Posts from r/nba<h3>`
        let curr = Math.min(10, posts.length);
        for(let i = 0; i < curr; i++){
            currPost = posts[i].data;
            markup += `
          <a class="post" href="https://www.reddit.com/${currPost.permalink}">
            <div class="title"> ${currPost.title} </div>
            <div class="content"> 
              ${currPost.selftext} 
              </br></br>
              <span>${currPost.url}</span>
            </div>
            <div class="author"> Posted by ${currPost.author} </div>
          </a>`;
        }

        container.insertAdjacentHTML('afterbegin', markup);
    }).catch(function(err) {
        console.log(err); // Log error if any
    });
};
  
// The Scroll Event.
window.addEventListener('scroll',()=>{
	const {scrollHeight,scrollTop,clientHeight} = document.documentElement;
	if(scrollTop + clientHeight > scrollHeight - 5){
		setTimeout(renderMorePosts,2000);
	}
});
// The createPost function creates The HTML for the blog post.
// It append it to the container.
function renderMorePosts(){
  let currPost, markup = ``;
  let newIndex = Math.min(curr+10, posts.length);
  
  for(let i = curr; i < newIndex; i++){
      currPost = posts[i].data;
      markup += `
    <a class="post" href="https://www.reddit.com/${currPost.permalink}">
      <div class="title"> ${currPost.title} </div>
      <div class="content"> 
        ${currPost.selftext} 
        </br></br>
        <span>${currPost.url}</span>
      </div>
      <div class="author"> Posted by ${currPost.author} </div>
    </a>`;
  }
  if(newIndex >= posts.length-1){
    const loading = document.getElementById("loading")
    if(loading){
      loading.remove();
      markup+=`<h3>No More Posts<h3>`
    }
  }
  curr = newIndex;
  container.insertAdjacentHTML('beforeend', markup);
}

