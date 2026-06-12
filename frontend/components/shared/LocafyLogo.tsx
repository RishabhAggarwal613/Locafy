import Image from 'next/image'
import Link from 'next/link'

type LocafyLogoProps = {
  href?: string
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  labelClassName?: string
}

const SIZES = {
  sm: { box: 28, image: 28 },
  md: { box: 32, image: 32 },
  lg: { box: 36, image: 36 },
} as const

export default function LocafyLogo({
  href = '/',
  label = 'Locafy',
  showLabel = true,
  size = 'md',
  className = '',
  labelClassName = '',
}: LocafyLogoProps) {
  const { box, image } = SIZES[size]

  const content = (
    <>
      <Image
        src="/icons/icon-192.png"
        alt="Locafy"
        width={image}
        height={image}
        className="rounded-lg shrink-0"
        priority
      />
      {showLabel && (
        <span className={`font-black tracking-tight ${labelClassName}`}>{label}</span>
      )}
    </>
  )

  const classes = `inline-flex items-center gap-2 group ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} style={{ minHeight: box }}>
        {content}
      </Link>
    )
  }

  return (
    <div className={classes} style={{ minHeight: box }}>
      {content}
    </div>
  )
}
