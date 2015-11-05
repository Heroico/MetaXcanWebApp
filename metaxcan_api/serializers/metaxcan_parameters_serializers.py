__author__ = 'heroico'


from rest_framework import serializers
from metaxcan_api.models import MetaxcanParameters

class MetaxcanParametersSerializer(serializers.HyperlinkedModelSerializer):
    # TODO: implement user view

    class Meta:
        model = MetaxcanParameters
        fields = ('id', 'job', 'owner', 'transcriptome', 'snp_column',
                  'other_allele_column', 'effect_allele_column',
                  'beta_column', 'beta_sign_column', 'p_column', )
        read_only_fields = ('id', )