import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    primary: {
      50: "#fafafc",
      100: "#e8eefd",
      200: "#b9cdf9",
      300: "#8aabf4",
      400: "#5c8af0",
      500: "#2563eb",
      600: "#134fd2",
      700: "#0f3ea3",
      800: "#0b2c75",
      900: "#061a46"
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a"
    },
    dark: {
      500: "#222222"
    }
  },
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  },
  styles: {
    global: {
      ".wp-admin #snippet-master": {
        ml: "-20px"
      },
      ".ba-modal-open": {
        "#adminmenuwrap": {
          zIndex: 999
        }
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "600"
      }
    },
    Heading: {
      baseStyle: {
        margin: 0
      }
    },
    Text: {
      baseStyle: {
        margin: 0
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: "10px",
        py: "2px",
        textTransform: "none",
        fontWeight: "600"
      }
    },
    Switch: {
      baseStyle: {
        track: {
          _checked: {
            bg: "#2563eb",
            borderColor: "#2563eb"
          }
        },
        thumb: {
          _checked: {
            bg: "white"
          }
        }
      }
    },
    Checkbox: {
      baseStyle: {
        control: {
          _checked: {
            bg: "#2563eb",
            borderColor: "#2563eb",
            color: "white"
          }
        }
      }
    }
  }
});
