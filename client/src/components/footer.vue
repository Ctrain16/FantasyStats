<template>
  <footer>
    <div class="copyright">
      <p>Cal Trainor ~ 2021</p>
    </div>
    <div class="logo-links">
      <a href="mailto:cal16trainor@gmail.com">
        <img
          class="logo"
          src="@/assets/send.svg"
          alt="Email"
          style="width: 20px; height: 20px"
        />
      </a>
      <a href="https://github.com/Ctrain16" target="_blank">
        <img
          class="logo"
          src="@/assets/github.svg"
          alt="GitHub"
          style="width: 22px; height: 22px; margin-left: 2vw"
        />
      </a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
};
</script>

<style>
footer {
  color: var(--color-blue);
  background-color: var(--color-ivory);
  border-top: solid 1px black;

  display: flex;
  align-items: center;
  position: absolute;
  bottom: 0;

  height: 50px;
  width: 100%;
}

.copyright {
  position: absolute;
  left: 10vw;

  font-size: 1rem;
}

.logo-links {
  position: absolute;
  right: 10vw;
}
</style>
