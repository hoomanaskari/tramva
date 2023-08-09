<script lang="js">
  import { onMount } from 'svelte';
  import Tramva from '../Tramva';
  import Sphere from '../Sphere';
  import Textbox from '../Textbox';

  onMount(async () => {
    const tramva = new Tramva({
      wrapperEl: document.getElementById('tramva-app-container')
    });
    tramva.addChild(
      new Sphere({
        tramva
      })
    );

    const font = await tramva._loadFont(
      'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-inter/data/typefaces/normal-900.json'
    );
    const text = new Textbox({
      font,
      size: 1,
      height: 0.25,
      curveSegments: 50,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.01,
      bevelSegments: 50
    });

    tramva.addChild(text);
  });
</script>

<div id="tramva-app-container" />

<style lang="scss">
  #tramva-app-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #383838;
  }
</style>
