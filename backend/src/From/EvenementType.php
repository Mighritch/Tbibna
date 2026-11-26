<?php

namespace App\Form;

use App\Document\Evenement;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\GreaterThan;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\NotNull;
use Symfony\Component\Validator\Constraints\Positive;
use Symfony\Component\Validator\Constraints\PositiveOrZero;

class EvenementType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('titre', TextType::class, [
                'label' => 'Titre',
                'empty_data' => '',
                'constraints' => [new NotBlank(message: 'Le titre est obligatoire.')],
            ])
            ->add('description', TextareaType::class, [
                'label' => 'Description',
                'empty_data' => '',
                'attr' => ['rows' => 5],
                'constraints' => [new NotBlank(message: 'La description est obligatoire.')],
            ])
            ->add('dateDebut', DateTimeType::class, [
                'label' => 'Date et heure de début',
                'widget' => 'single_text',
                'constraints' => [new NotNull(message: 'La date de début est obligatoire.')],
            ])
            ->add('dateFin', DateTimeType::class, [
                'label' => 'Date et heure de fin',
                'widget' => 'single_text',
                'constraints' => [
                    new NotNull(message: 'La date de fin est obligatoire.'),
                    new GreaterThan(
                        propertyPath: 'parent.all[dateDebut].data',
                        message: 'La date de fin doit être postérieure à la date de début.'
                    ),
                ],
            ])
            ->add('localisation', TextType::class, [
                'label' => 'Localisation',
                'empty_data' => '',
                'constraints' => [new NotBlank(message: 'La localisation est obligatoire.')],
            ])
            ->add('nombreDeParticipant', IntegerType::class, [
                'label' => 'Nombre de participants',
                'constraints' => [
                    new NotNull(message: 'Le nombre de participants est obligatoire.'),
                    new Positive(message: 'Le nombre de participants doit être supérieur à 0.'),
                ],
            ])
            ->add('prix', NumberType::class, [
                'label' => 'Prix (DT)',
                'scale' => 2,
                'html5' => true,
                'constraints' => [
                    new NotNull(message: 'Le prix est obligatoire.'),
                    new PositiveOrZero(message: 'Le prix ne peut pas être négatif.'),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Evenement::class,
        ]);
    }
}