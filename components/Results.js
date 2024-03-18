//TODO: This is where the results will appears after being returned from the 'getData' api route
//TODO: If just one page, show results for that one page, if multiple pages, show first page as cumulative results, than can filter down per page, etc.
import { forwardRef, useState } from "react"
import { Box, Divider, Grid, Slider, Stack, Typography, useTheme } from "@mui/material"
import Image from "next/image"
import { TestResult } from '../test/TestResult'

const Results = forwardRef((props, ref) => {
  const { results, setResults, viewportWidth } = props
  const theme = useTheme()
  const [sliderValues, setSliderValues] = useState(
    TestResult.doc_analysis.pages.map(page => ({
      qualityScore: page.quality_score * 100,
      detectedLanguages: page.detected_languages.map(lang => parseFloat((lang.confidence * 100).toFixed(2)))
    }))
  )

  return (
    <Stack
      spacing={1}
    //ref={ref}
    >
      <Box>
        <Image
          src={TestResult.doc_analysis.doc_image}
          alt='Analyzed Document'
        />
      </Box>
      <Divider />
      <Grid
        container
        spacing={1}
      >
        <Grid item xs={4}>
          {TestResult.doc_analysis.doc_text}
        </Grid>
        <Grid item xs={4}>
          {TestResult.doc_analysis.doc_summary}
        </Grid>
        <Grid item xs={4}>
          {TestResult.doc_analysis.pages.map((page, pageIndex) => (
            <Stack
              spacing={1}
            >
              <Slider
                value={sliderValues[pageIndex].qualityScore}
                size='small'
                disabled
              />
              <Divider />
              <Box>
                {page.detected_languages.map((lang, langIndex) => (
                  <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    gap: '10px'
                  }}
                  >
                    <Typography
                      sx={{
                        width: '30%'
                      }}
                    >
                      {lang.languageCode}
                    </Typography>
                    <Slider
                      key={pageIndex}
                      value={sliderValues[pageIndex].detectedLanguages[langIndex]}
                      size='small'
                      disabled
                      sx={{
                        width: '60%'
                      }}
                    />
                    <Typography
                      sx={{
                        width: '10%'
                      }}
                    >
                      {`${sliderValues[pageIndex].detectedLanguages[langIndex]}%`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
          ))}
        </Grid>
      </Grid>
    </Stack>
  )
})

export default Results