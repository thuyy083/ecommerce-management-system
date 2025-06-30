import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useForm, Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Routes } from '~/config'

function UnitInvoiceForm({ submit, data }) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    console.log('data:', data)

    await submit(data)
  }
  return (
    <Box
      sx={{
        minHeight: '400px',
      }}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Controller
                  name="unitName"
                  control={control}
                  defaultValue={data?.UNIT_NAME}
                  rules={{ required: 'Vui lòng nhập tên đơn vị tiền tệ', }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên"
                      name='unitName'
                      fullWidth
                      error={!!errors.unitName}
                      helperText={errors.unitName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name="unitNameEn"
                  control={control}
                  defaultValue={data?.UNIT_NAME_EN}
                  rules={{ required: 'Vui lòng nhập tên tiếng Anh của đơn vị tiền tệ' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên tiếng anh"
                      name='unitNameEn'
                      type="text"
                      fullWidth
                      error={!!errors.unitNameEn}
                      helperText={errors.unitNameEn?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name="unitABB"
                  control={control}
                  defaultValue={data?.UNIT_ABB}
                  rules={{ required: 'Vui lòng nhập tên viết tắt của đơn vị tiền tệ' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên tiếng viết tắt"
                      name='unitABB'
                      type="text"
                      fullWidth
                      error={!!errors.unitABB}
                      helperText={errors.unitABB?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" color="secondary" type="reset"
            LinkComponent={Link} to={Routes.admin.unitInvoice.list}
          >
            Hủy
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Lưu
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default UnitInvoiceForm