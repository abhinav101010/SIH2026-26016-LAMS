import { forwardRef } from "react";
import { Paper, Box, Typography } from "@mui/material";

const ChartCard = forwardRef(
  (
    {
      children,
      title,
      subtitle,
      icon: Icon,
      height = 360,
      sx = {},
      action,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <Paper
        ref={ref}
        elevation={0}
        className={className}
        {...props}
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height,
          minHeight: height,
      
          display: 'flex',
          flexDirection: 'column',

          flex: 1,

          borderRadius: 4,
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)"
            }`,

          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.25)"
              : "0 4px 24px rgba(30,111,255,0.04)",

          overflow: "hidden",

          transition: "box-shadow 0.3s ease, transform 0.3s ease",

          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.35)"
                : "8px 12px 32px rgba(30,111,255,0.06), 4px 6px 14px rgba(15,23,42,0.03)",
          },

          // IMPORTANT:
          // use sx, NOT props.sx
          ...sx,
        }}
      >
        {/* ==================== CARD HEADER ==================== */}
        {(title || subtitle || Icon || action) && (
          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 2,

              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",

              flexShrink: 0,
              minWidth: 0,
            }}
          >
            {/* Title + Icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              {Icon && (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </Box>
              )}

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                {title && (
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </Typography>
                )}

                {subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.3,
                      display: "block",
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Optional action */}
            {action && (
              <Box
                sx={{
                  flexShrink: 0,
                  ml: 2,
                }}
              >
                {action}
              </Box>
            )}
          </Box>
        )}

        {/* ==================== CHART CONTENT ==================== */}
        <Box
          sx={{
            px: 3,
            pb: 3,

            width: "100%",
            minWidth: 0,

            // Take all remaining card height
            flex: 1,

            // Very important for Recharts / responsive charts
            minHeight: 0,

            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              minWidth: 0,
              minHeight: 0,
              flex: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </Paper>
    );
  },
);

ChartCard.displayName = "ChartCard";

export default ChartCard;
