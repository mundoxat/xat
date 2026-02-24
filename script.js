let opacity = 1;
    const textElement = document.getElementById('pageText');

    const fadeOutText = () => {
      const interval = setInterval(() => {
        opacity -= 0.02;
        textElement.style.opacity = opacity.toFixed(2);
        if (opacity <= 0) {
          clearInterval(interval);
          textElement.style.display = 'none';
        }
      }, 50);
    };

    setTimeout(fadeOutText, 5000);

    