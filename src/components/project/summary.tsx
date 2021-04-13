import 'twin.macro'

type SummaryProps = {
  name: string
}

export function Summary({ name }: SummaryProps) {
  return (
    <div tw="col-span-1 mx-auto pt-10">
      <div tw="bl-text-4xl">{name}</div>
    </div>
  )
}
